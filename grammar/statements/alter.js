const { paren_list, comma_list, optional_parenthesis, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

    _alter_statement: $ => seq(
      choice(
        $.alter_table,
        $.alter_foreign_table,
        $.alter_type,
        $.alter_role,
      ),
    ),

    // Teradata ALTER TABLE. Six documented forms, one per branch:
    //   Basic            SQL DDL Syntax and Examples, ALTER TABLE Syntax (Basic)
    //   Join Index       ALTER TABLE Syntax (Join Index)
    //   Revalidation     ALTER TABLE Syntax (Revalidation)
    //   Release Rows     ALTER TABLE Syntax (Release Rows)
    //   Map/Colocation   handled by $.pre_table_option — MAP = name
    //                    [COLOCATE USING name] is already its first branch
    //   TO CURRENT       ALTER TABLE TO CURRENT Syntax
    //
    // Not Teradata and deliberately excluded (other dialects only):
    //   ALTER COLUMN ... SET/DROP DEFAULT/NOT NULL/TYPE  (PostgreSQL)
    //   MODIFY COLUMN / CHANGE COLUMN                     (MySQL)
    //   ALTER TABLE ... RENAME TO                         (Teradata uses the
    //                                                      RENAME TABLE stmt)
    //   OWNER TO                                          (PostgreSQL)
    //   DROP CONSTRAINT ... CASCADE | RESTRICT            (PostgreSQL)
    //   ADD/DROP/RENAME COLUMN with the COLUMN keyword    (Teradata omits it)
    alter_table: $ => seq(
      optional($.keyword_nontemporal),
      $.keyword_alter,
      $.keyword_table,
      $.object_reference,
      choice(
        $._alter_table_basic,
        $.revalidate_clause,
        $.release_rows_clause,
        $.to_current_clause,
      ),
    ),

    // --- Basic form ---------------------------------------------------
    //   { alter_option [,...]
    //   | table_option [,...] [alter_option [,...]]
    //   | normalize | DROP NORMALIZE
    //   | modify_primary
    //   | MODIFY NO PRIMARY [INDEX] [alter_partitioning]
    //   | MODIFY alter_partitioning
    //   | FROM TIME ZONE = [sign] 'string' [, TIMEDATEWZCONTROL = n]
    //       [, WITH TIME ZONE]
    //   | {SET | RESET} DOWN }
    //
    // $.pre_table_option carries its own leading comma, which is exactly the
    // `ALTER TABLE t, FALLBACK` form, and is the same production CREATE TABLE
    // uses — no duplication. The two comma-separated lists need no declared
    // conflict: every alter_option starts with ADD, DROP, RENAME or MODIFY and
    // no pre_table_option_spec starts with any of those, so one token of
    // lookahead after the comma separates them.
    _alter_table_basic: $ => choice(
      // table_option [,...] [alter_option [,...]]
      // One comma-list, not two adjacent ones: a table option and an alter
      // option are alternatives *within* the list. Two adjacent comma-lists
      // would force the parser to pick between them at the comma itself,
      // before seeing the token that tells them apart.
      seq(',', comma_list($._alter_table_element, true)),
      comma_list($._alter_specifications, true),
      $.add_normalize,
      $.drop_normalize,
      $.modify_primary_index,
      $.alter_partitioning,
      $.from_time_zone,
      $.down_state,
    ),

    _alter_table_element: $ => choice(
      $.pre_table_option_spec,
      $._alter_specifications,
    ),

    _alter_specifications: $ => choice(
      $.add_column,
      $.add_column_partition,
      $.add_constraint,
      seq($.keyword_add, $._derived_period),
      $.modify_check,
      $.drop_constraint,
      $.drop_column,
      $.drop_period,
      $.rename_column,
    ),

    // ADD [COLUMN | ROW | SYSTEM] (col [,...]) [INTO col2]
    //     [[NO] AUTO COMPRESS]
    add_column_partition: $ => seq(
      $.keyword_add,
      optional(choice($.keyword_column, $.keyword_row, $.keyword_system)),
      paren_list($.identifier, true),
      optional(seq($.keyword_into, field('into', $.identifier))),
      optional(seq(optional($.keyword_no), $.keyword_auto, $.keyword_compress)),
    ),

    // --- Revalidation form ---------------------------------------------
    revalidate_clause: $ => seq(
      $.keyword_revalidate,
      optional($._with_save_option),
    ),

    // --- Release Rows form ----------------------------------------------
    //   RELEASE [DELETED] ROWS [AND RESET LOAD IDENTITY]
    release_rows_clause: $ => seq(
      $.keyword_release,
      optional($.keyword_deleted),
      $.keyword_rows,
      optional(seq(
        $.keyword_and,
        $.keyword_reset,
        $.keyword_load,
        $.keyword_identity,
      )),
    ),

    // --- TO CURRENT form -------------------------------------------------
    //   TO CURRENT [WITH [INSERT [INTO] save_table | DELETE]]
    to_current_clause: $ => seq(
      $.keyword_to,
      $.keyword_current,
      optional($._with_save_option),
    ),

    // The inner choice is optional per the docs, so a bare WITH is legal.
    _with_save_option: $ => seq(
      $.keyword_with,
      optional(choice(
        seq(
          $.keyword_insert,
          optional($.keyword_into),
          field('save_table', $.object_reference),
        ),
        $.keyword_delete,
      )),
    ),

    // --- Basic-form alter options ----------------------------------------

    // ADD PERIOD FOR period_name (begin_column, end_column)
    add_period: $ => seq(
      $.keyword_add,
      $.keyword_period,
      $.keyword_for,
      field('name', $.identifier),
      paren_list($.identifier, true),
    ),

    // DROP PERIOD FOR period_name
    drop_period: $ => seq(
      $.keyword_drop,
      $.keyword_period,
      $.keyword_for,
      field('name', $.identifier),
    ),

    // ADD NORMALIZE [ALL BUT (cols)] ON col
    //   [ON {MEETS OR OVERLAPS | OVERLAPS OR MEETS}]
    add_normalize: $ => seq(
      $.keyword_add,
      $.keyword_normalize,
      optional(seq($.keyword_all, $.keyword_but, paren_list($.identifier, true))),
      $.keyword_on,
      field('column', $.identifier),
      optional(seq(
        $.keyword_on,
        choice(
          seq($.keyword_meets, $.keyword_or, $.keyword_overlaps),
          seq($.keyword_overlaps, $.keyword_or, $.keyword_meets),
        ),
      )),
    ),

    drop_normalize: $ => seq($.keyword_drop, $.keyword_normalize),

    // MODIFY [[CONSTRAINT] name] CHECK (boolean_condition)
    modify_check: $ => seq(
      $.keyword_modify,
      optional(seq(optional($.keyword_constraint), field('name', $.identifier))),
      $.keyword_check,
      wrapped_in_parenthesis($._expression),
    ),

    // MODIFY [[NOT] UNIQUE] PRIMARY [AMP] [INDEX] [name | NOT NAMED]
    //        [(cols)] [alter_partitioning]
    // MODIFY NO PRIMARY [INDEX] [alter_partitioning]
    modify_primary_index: $ => seq(
      $.keyword_modify,
      choice(
        seq(
          optional(seq(optional($.keyword_not), $.keyword_unique)),
          $.keyword_primary,
          optional($.keyword_amp),
          optional($.keyword_index),
          optional(choice(
            seq($.keyword_not, $.keyword_named),
            field('name', $.identifier),
          )),
          optional($._index_column_list),
        ),
        seq($.keyword_no, $.keyword_primary, optional($.keyword_index)),
      ),
      optional($._alter_partitioning_spec),
    ),

    // MODIFY { PARTITION BY (...) | NOT PARTITIONED }
    // The DROP/ADD range_expression forms are not covered yet.
    alter_partitioning: $ => seq(
      $.keyword_modify,
      $._alter_partitioning_spec,
    ),

    // Hidden so modify_primary_index can take it as a tail without a second
    // MODIFY keyword, which is what the spec requires.
    _alter_partitioning_spec: $ => choice(
      seq($.keyword_partition, $.keyword_by, $._index_column_list),
      seq($.keyword_not, $.keyword_partitioned),
    ),

    // FROM TIME ZONE = 'string' [, TIMEDATEWZCONTROL = n] [, WITH TIME ZONE]
    from_time_zone: $ => seq(
      $.keyword_from,
      $.keyword_time,
      $.keyword_zone,
      '=',
      alias($._single_quote_string, $.literal),
      optional(seq(',', $.keyword_timedatewzcontrol, '=', $._integer)),
      optional(seq(',', $.keyword_with, $.keyword_time, $.keyword_zone)),
    ),

    down_state: $ => seq(
      choice($.keyword_set, $.keyword_reset),
      $.keyword_down,
    ),

    // --- ALTER FOREIGN TABLE ---------------------------------------------
    //   ALTER FOREIGN TABLE table_specification
    //     [, table_option [,...]]
    //     [, external_security_clause]
    //     [column_option]
    //     [UPDATE update_specification]
    //     [MODIFY PARTITION BY ([COLUMN,] partition_column_spec [,...])]
    alter_foreign_table: $ => prec.right(0, seq(
      $.keyword_alter,
      $.keyword_foreign,
      $.keyword_table,
      $.object_reference,
      optional(seq(',', comma_list(choice($.pre_table_option_spec, $.external_security_clause), true))),
      optional($._foreign_column_option),
      optional(seq($.keyword_update, $.foreign_update_specification)),
      optional($.modify_partition_by),
    )),

    // EXTERNAL SECURITY [{INVOKER | DEFINER} TRUSTED] [db.]authorization_name
    external_security_clause: $ => seq(
      $.keyword_external,
      $.keyword_security,
      optional(seq(
        choice($.keyword_invoker, $.keyword_definer),
        $.keyword_trusted,
      )),
      field('authorization', $.object_reference),
    ),

    // column_option: the ADD / DROP / RENAME productions are the same ones the
    // basic form uses, so reuse them rather than restating the grammar.
    _foreign_column_option: $ => choice(
      $.add_column,
      $.add_column_partition,
      $.drop_column,
      $.rename_column,
    ),

    // MODIFY PARTITION BY ([COLUMN,] partition_column_spec [,...])
    modify_partition_by: $ => seq(
      $.keyword_modify,
      $.keyword_partition,
      $.keyword_by,
      wrapped_in_parenthesis(seq(
        optional(seq($.keyword_column, ',')),
        comma_list($.partition_column_spec, true),
      )),
    ),

    partition_column_spec: $ => seq(
      field('name', $.identifier),
      $._type,
    ),

    // LOCATION / PATHPATTERN / MANIFEST / ROWFORMAT / STOREDAS /
    // STRIP_EXTERIOR_SPACES / STRIP_ENCLOSING_CHAR, each NAME [(value)].
    foreign_update_specification: $ => repeat1($.foreign_table_option),

    foreign_table_option: $ => seq(
      field('name', $.identifier),
      optional(wrapped_in_parenthesis(
        field('value', choice($.literal, $.identifier)),
      )),
    ),

    // ADD column_name <column_attributes>
    // The optional keyword_add allows for chained ALTER TABLE specifications
    // where ADD applies to the first column only (e.g. ADD c1 INT, c2 INT).
    add_column: $ => seq(
      optional($.keyword_add),
      $.column_definition,
    ),

    // ADD [CONSTRAINT name] <constraint>
    add_constraint: $ => seq(
      $.keyword_add,
      optional($.keyword_constraint),
      $.identifier,
      $.constraint,
    ),

    // DROP CONSTRAINT name [CHECK]
    drop_constraint: $ => seq(
      $.keyword_drop,
      $.keyword_constraint,
      $.identifier,
      optional($.keyword_check),
    ),

    // DROP column_name
    drop_column: $ => seq(
      $.keyword_drop,
      choice(
        seq($.keyword_inconsistent, $.keyword_references),
        seq(field('name', $._column), optional($.keyword_identity)),
      ),
    ),

    // RENAME old_column_name TO new_column_name
    rename_column: $ => seq(
      $.keyword_rename,
      field('old_name', $.identifier),
      choice($.keyword_to, $.keyword_as),
      field('new_name', $.identifier),
    ),

    alter_role: $ => seq(
      $.keyword_alter,
      choice(
        $.keyword_role,
        $.keyword_group,
        $.keyword_user,
      ),
      choice($.identifier, $.keyword_all),
      choice(
        $.rename_object,
        seq(optional($.keyword_with),repeat($._role_options)),
        seq(
          optional(seq($.keyword_in, $.keyword_database, $.identifier)),
          choice(
            seq(
              $.keyword_set,
              $.set_configuration,
            ),
            seq(
              $.keyword_reset,
              choice(
                $.keyword_all,
                field("option", $.identifier),
              )),
          ),
        )
      ),
    ),

    set_configuration: $ => seq(
      field("option", $.identifier),
      choice(
        seq($.keyword_from, $.keyword_current),
        seq(
          choice($.keyword_to, "="),
          choice(
            field("parameter", $.identifier),
            $.literal,
            $.keyword_default
          )
        )
      ),
    ),

    alter_type: $ => seq(
      $.keyword_alter,
      $.keyword_type,
      field('name', $.object_reference),
      choice(
        // ADD <method_specification>
        seq($.keyword_add, $.method_specification),

        // DROP [INSTANCE | CONSTRUCTOR] METHOD name(params) [SPECIFIC name]
        seq(
          $.keyword_drop,
          optional(choice($.keyword_instance, $.keyword_constructor)),
          $.keyword_method,
          field('method_name', $.object_reference),
          wrapped_in_parenthesis(
            optional(comma_list($.parameter_specification, true))
          ),
          optional(seq($.keyword_specific, $.object_reference)),
        ),

        // ADD ATTRIBUTE <attribute_specification>
        seq($.keyword_add, $.keyword_attribute, $.attribute_specification),

        // DROP ATTRIBUTE attribute_name
        seq(
          $.keyword_drop,
          $.keyword_attribute,
          field('attribute_name', $.identifier),
        ),

        // COMPILE [ONLY] standalone
        seq($.keyword_compile, optional($.keyword_only)),
      ),
      // optional trailing COMPILE [ONLY]
      optional(seq($.keyword_compile, optional($.keyword_only))),
    ),

};
