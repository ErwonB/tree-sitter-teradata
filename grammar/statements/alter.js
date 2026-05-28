const { paren_list, comma_list, optional_parenthesis, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

    _alter_statement: $ => seq(
      choice(
        $.alter_table,
        $.alter_type,
        $.alter_role,
      ),
    ),

    // Teradata ALTER TABLE (Basic) — see:
    // https://docs.teradata.com/r/Enterprise_IntelliFlex_VMware/SQL-Data-Definition-Language-Syntax-and-Examples/Table-Statements/ALTER-TABLE
    //
    //   [NONTEMPORAL] ALTER TABLE [database.]table_name
    //       <alter_specification> [, <alter_specification> ...]
    //
    // where <alter_specification> is one of:
    //   ADD column_name <column_attributes>          (also used to modify existing column)
    //   ADD CONSTRAINT name <constraint>             (named PK/UNIQUE/FK/CHECK)
    //   ADD <constraint>                             (unnamed constraint)
    //   DROP column_name
    //   DROP CONSTRAINT name [CHECK]
    //   RENAME old_column_name TO new_column_name
    //
    // Notes on what is intentionally NOT supported here because it is not
    // Teradata syntax (handled by other dialects only):
    //   * ALTER COLUMN ... SET/DROP DEFAULT/NOT NULL/TYPE/STORAGE/...   (PostgreSQL)
    //   * MODIFY COLUMN ...                                             (MySQL/others)
    //   * CHANGE COLUMN ...                                             (MySQL)
    //   * ALTER TABLE ... RENAME TO ...                                 (Teradata uses
    //                                                                    the separate
    //                                                                    RENAME TABLE
    //                                                                    statement)
    //   * OWNER TO ...                                                  (PostgreSQL)
    //   * DROP CONSTRAINT ... CASCADE | RESTRICT                        (PostgreSQL)
    //   * ADD COLUMN / DROP COLUMN / RENAME COLUMN with the COLUMN
    //     keyword (Teradata syntax omits the COLUMN keyword)
    alter_table: $ => seq(
      optional($.keyword_nontemporal),
      $.keyword_alter,
      $.keyword_table,
      $.object_reference,
      choice(
        seq(
          $._alter_specifications,
          repeat(
            seq(
              ",",
              $._alter_specifications
            )
          )
        ),
      ),
    ),

    _alter_specifications: $ => choice(
      $.add_column,
      $.add_constraint,
      $.drop_constraint,
      $.drop_column,
      $.rename_column,
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
      field('name', $.identifier),
    ),

    // RENAME old_column_name TO new_column_name
    rename_column: $ => seq(
      $.keyword_rename,
      field('old_name', $.identifier),
      $.keyword_to,
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
