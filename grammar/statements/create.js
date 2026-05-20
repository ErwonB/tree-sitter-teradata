const {
  comma_list,
  optional_parenthesis,
  paren_list,
  parametric_type,
  wrapped_in_parenthesis,
} = require('../helpers.js');

module.exports = {

    _create_statement: $ => seq(
      choice(
        $.create_table,
        $.create_view,
        $.create_index,
        $.create_function,
        $.create_procedure,
        $.create_type,
        $.create_database,
        $.create_role,
        $.create_macro,
        $.create_sequence,
        $.create_trigger,
        $.create_join_index,
      ),
    ),

    _modify_statement: $ => seq(
      choice(
        $.modify_database,
      ),
    ),

    _table_settings: $ => choice(
      $.table_partition,
      $.storage_location,
      $.table_sort,
      $.row_format,
      seq(
        $.keyword_tblproperties,
        paren_list($.table_option, true),
      ),
      $.storage_parameters,
      $.table_option,
      $.primary_index_clause,
      $.index_clause,
      $.partition_by_clause,
      seq($.keyword_no, $.keyword_primary, $.keyword_index),
    ),

    storage_parameters: $ => seq(
      $.keyword_with,
      paren_list(
        seq($.identifier, optional(seq('=', $.literal))),
        true
      ),
    ),

    with_data_clause: $ => seq(
      $.keyword_with,
      optional($.keyword_no),
      $.keyword_data,
      optional(seq($.keyword_and, $.keyword_statistics)),
    ),

    _multiset_or_set: $ => choice(
      $.keyword_multiset,
      $.keyword_set,
    ),

    _volatile_or_global_temp : $ => choice(
      $.keyword_volatile,
      seq($.keyword_global, $.keyword_temporary),
    ),


    // left precedence because 'quoted' table options otherwise conflict with
    // `create function` string bodies; if you remove this precedence you will
    // have to also disable the `_literal_string` choice for the `name` field
    // in =-assigned `table_option`s
    create_table: $ => prec.left(
      seq(
        choice($.keyword_ct,
          seq(
              $.keyword_create,
              optional(
                choice(
                  seq($._multiset_or_set, optional($._volatile_or_global_temp)),
                  seq($._volatile_or_global_temp, optional($._multiset_or_set)),
                ),
              ),
              $.keyword_table,
            ),
          ),
        $.object_reference,
        optional($.pre_table_option),
        choice(
          seq(
            $.column_definitions,
            repeat($._table_settings),
            optional(
              seq(
                $.keyword_as,
                $._select_statement,
              ),
            )
          ),
          seq(
            repeat($._table_settings),
            seq(
              $.keyword_as,
              $.create_query,
              optional($.with_data_clause)
            ),
          ),
          seq($.keyword_as,
            $.object_reference,
            optional($.with_data_clause),
          )
        ),
      ),
    ),

    create_query: $ => seq(
      $._dml_read,
    ),


    create_view: $ => prec.right(
      seq(
        choice($.keyword_create, $.keyword_replace),
        optional($._temporary),
        optional($.keyword_recursive),
        $.keyword_view,
        $.object_reference,
        optional(paren_list($.identifier)),
        $.keyword_as,
        $.create_query,
        optional(
          seq(
            $.keyword_with,
            optional(
                $.keyword_local,
            ),
            $._check_option,
          ),
        ),
      ),
    ),

    create_join_index: $ => prec.right(
      seq(
        $.keyword_create, $.keyword_join, $.keyword_index,
        $.object_reference,
        //missing table options
        $.keyword_as,
        $.create_query,
        optional(seq($.primary_index_clause, $.partition_by_clause)),
      ),
    ),


    _operator_class: $ => seq(
      field("opclass", $.identifier),
      optional(
        field("opclass_parameters", wrapped_in_parenthesis(comma_list($.term)))
      )
    ),

    _index_field: $ => seq(
      choice(
        field("expression", wrapped_in_parenthesis($._expression)),
        field("function", $.invocation),
        field("column", $._column),
      ),
      optional(seq($.keyword_collate, $.identifier)),
      optional($._operator_class),
      optional($.direction),
      optional(
        seq(
          $.keyword_nulls,
          choice(
            $.keyword_first,
            $.keyword_last
          )
        )
      ),
    ),

    index_fields: $ => wrapped_in_parenthesis(comma_list(alias($._index_field, $.field))),

    create_index: $ => seq(
      $.keyword_create,
      optional($.keyword_unique),
      $.keyword_index,
      optional(
        seq(
          field("column", $._column),
        ),
      ),
      $.keyword_on,
      seq(
        $.object_reference,
        optional(
          seq(
            $.keyword_using,
            choice(
              $.keyword_hash,
            ),
          ),
        ),
        $.index_fields
      ),
      optional(
        $.where,
      ),
    ),

    _with_settings: $ => seq(
          field('name', $.identifier),
          optional('='),
          field('value', choice($.identifier, alias($._single_quote_string, $.literal))),
    ),

_database_attribute: $ => choice(
  // SPOOL | TEMPORARY = n [BYTES] [SKEW=...]
  seq(
    choice($.keyword_spool, $.keyword_temporary),
    '=',
    $._expression,
    optional($.keyword_bytes),
    optional($._skew_spec)
  ),

  // ACCOUNT = 'account_string'
  seq(
    $.keyword_account,
    '=',
    alias($._single_quote_string, $.literal)
  ),

  // DEFAULT MAP = map_name | NULL [OVERRIDE [NOT] ON ERROR]
  seq(
    $.keyword_default,
    $.keyword_map,
    '=',
    choice(
      $.identifier,
      $.keyword_null
    ),
    optional(
      seq(
        $.keyword_override,
        optional($.keyword_not),
        $.keyword_on,
        $.keyword_error
      )
    )
  ),

  // [NO] FALLBACK [PROTECTION]
  seq(
    optional($.keyword_no),
    $.keyword_fallback,
    optional($.keyword_protection)
  ),

  // [NO | DUAL] [BEFORE] JOURNAL
  seq(
    optional(
      choice(
        seq($.keyword_no, $.keyword_dual),
        $.keyword_before,
       )
      ),
    $.keyword_journal
  ),

  // [NO | DUAL | [NOT] LOCAL] AFTER JOURNAL
  seq(
    optional(choice(
      $.keyword_no,
      $.keyword_dual,
      seq(optional($.keyword_not), $.keyword_local)
    )),
    $.keyword_after,
    $.keyword_journal
  ),

  // DEFAULT JOURNAL TABLE = [database_name.]table_name
  seq(
    $.keyword_default,
    $.keyword_journal,
    $.keyword_table,
    '=',
    $.object_reference
  )
),

  _skew_spec: $ => seq(
      $.keyword_skew,
      '=',
      choice(
        $._expression,
        $.keyword_default
      ),
      optional($.keyword_percent),
    ),

    create_database: $ => seq(
      // { CREATE DATABASE | CD }
      choice(
        seq($.keyword_create, $.keyword_database),
        $.keyword_cd
      ),
      field('name', $.object_reference),
      // [ FROM database_name ]
      optional(
        seq(
          $.keyword_from,
          field('from', $.object_reference)
        )
      ),
      // AS
      $.keyword_as,
      // { PERMANENT | PERM } = { n | constant_expression } [ BYTES ] [ SKEW = ... ]
      seq(
        choice($.keyword_permanent, $.keyword_perm),
        '=',
        field('permanent_size', $._expression),
        optional($.keyword_bytes),
        optional($._skew_spec)
      ),
        optional(seq(',', comma_list($._database_attribute, false)))
    ),

    _drop_database_attribute: $ => choice(
        seq(
          choice($.keyword_permanent, $.keyword_perm),
          '=',
          field('permanent_size', $._expression),
          optional($.keyword_bytes),
          optional($._skew_spec)
        ),
        $._database_attribute,
          // DROP DEFAULT JOURNAL TABLE = [database_name.]table_name
          seq(
            $.keyword_drop,
            $.keyword_default,
            $.keyword_journal,
            $.keyword_table,
            '=',
            $.object_reference
          )
    ),

    modify_database: $ => seq(
      // MODIFY DATABASE
      $.keyword_modify, $.keyword_database,
      field('name', $.object_reference),
      // AS
      $.keyword_as,
      comma_list($._drop_database_attribute, true)
    ),

    create_role: $ => seq(
      $.keyword_create,
      choice(
        $.keyword_user,
        $.keyword_role,
        $.keyword_group,
      ),
      $.identifier,
      optional($.keyword_with),
      repeat(
        choice(
          $._user_access_role_config,
          $._role_options,
        ),
      ),
    ),

    _role_options: $ => choice(
      field("option", $.identifier),
      seq(
        $.keyword_valid,
        $.keyword_until,
        field("valid_until", alias($._literal_string, $.literal))
      ),
      seq(
        $.keyword_connection,
      ),
      seq(
        optional($.keyword_encrypted),
        $.keyword_password,
        choice(
          field("password", alias($._literal_string, $.literal)),
          $.keyword_null,
        ),
      ),
    ),

    _user_access_role_config: $ => seq(
      choice(
        seq(optional($.keyword_in), $.keyword_role),
        seq($.keyword_in, $.keyword_group),
        $.keyword_admin,
        $.keyword_user,
      ),
      comma_list($.identifier, true),
    ),

    create_sequence: $ => seq(
      $.keyword_create,
      optional(
          choice($.keyword_temporary, $.keyword_temp),
      ),
      $.keyword_sequence,
      $.object_reference,
      repeat(
        choice(
          seq($.keyword_as, $._type),
          seq($.keyword_increment, optional($.keyword_by), field("increment", alias($._integer, $.literal))),
          seq($.keyword_minvalue, choice($.literal, seq($.keyword_no, $.keyword_minvalue))),
          seq($.keyword_no, $.keyword_minvalue),
          seq($.keyword_maxvalue, choice($.literal, seq($.keyword_no, $.keyword_maxvalue))),
          seq($.keyword_no, $.keyword_maxvalue),
          seq($.keyword_start, optional($.keyword_with), field("start", alias($._integer, $.literal))),
          seq($.keyword_cache, field("cache", alias($._integer, $.literal))),
          seq(optional($.keyword_no), $.keyword_cycle),
          seq($.keyword_owned, $.keyword_by, choice($.keyword_none, $.object_reference)),
        )
      ),
    ),

    create_trigger: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      // mariadb
      optional(seq($.keyword_definer, '=', $.identifier)),
      optional($.keyword_constraint),
      // sqlite
      optional($._temporary),
      $.keyword_trigger,
      // sqlite/mariadb
      $.object_reference,
      choice(
        $.keyword_before,
        $.keyword_after,
        seq($.keyword_instead, $.keyword_of),
      ),
      $._create_trigger_event,
      repeat(seq($.keyword_or, $._create_trigger_event)),
      $.keyword_on,
      $.object_reference,
      repeat(
        choice(
          seq($.keyword_from, $.object_reference),
          choice(
            seq($.keyword_not, $.keyword_deferrable),
            $.keyword_deferrable,
            seq($.keyword_initially, $.keyword_immediate),
            seq($.keyword_initially, $.keyword_deferred),
          ),
          seq($.keyword_referencing, choice($.keyword_old, $.keyword_new), $.keyword_table, optional($.keyword_as), $.identifier),
          seq(
            $.keyword_for,
            optional($.keyword_each),
            choice($.keyword_row, $.keyword_statement),
            // mariadb
            optional(seq(choice($.keyword_follows, $.keyword_precedes), $.identifier)),
          ),
          seq($.keyword_when, wrapped_in_parenthesis($._expression)),
        ),
      ),
      $._exec,
      choice($.keyword_function, $.keyword_procedure),
      $.object_reference,
      paren_list(field('parameter', $.term)),
    ),

    _create_trigger_event: $ => choice(
      $._insert,
      seq(
        $._update,
        optional(
          seq(
            $.keyword_of,
            comma_list($.identifier, true),
          ),
        ),
      ),
      $._delete,
    ),

    create_type: $ => seq(
      $.keyword_create,
      $.keyword_type,
      field('name', $.object_reference),
      $.keyword_as,
      choice(
        $._type_structured_form,
        $._type_distinct_form,
        $._type_array_form
      )
    ),

    // --- Structured Form ---
    _type_structured_form: $ => seq(
      wrapped_in_parenthesis(comma_list($.attribute_specification, true)),
      optional($.keyword_instantiable),
      $.keyword_not,
      $.keyword_final,
      optional(comma_list($.method_specification, true))
    ),

    attribute_specification: $ => prec(2, seq(
      field('name', $.identifier),
      choice(
        seq($._type, optional(seq($.keyword_character, $.keyword_set, $.identifier))),
        field('udt_name', $.object_reference)
      )
     )
    ),

    method_specification: $ => prec(1, seq(
        optional(choice($.keyword_instance, $.keyword_constructor)),
        $.keyword_method,
        field('method_name', $.object_reference),
        wrapped_in_parenthesis(optional(comma_list($.parameter_specification, true))),
        $.keyword_returns,
        $.returns_parameter_specification,
        optional(seq(
          $.keyword_cast,
          $.keyword_from,
          choice($._type, $.object_reference),
          optional(seq($.keyword_as, $.keyword_locator))
        )),
        optional(seq($.keyword_specific, $.object_reference)),
        optional(seq($.keyword_self, $.keyword_as, $.keyword_result)),
        optional(repeat1(choice($.language_and_access_specification, $.type_attribute))),
      ),
    ),

    // --- Distinct Form ---
    _type_distinct_form: $ => seq(
      $._type,
      optional(seq($.keyword_character, $.keyword_set, $.identifier)),
      $.keyword_final,
      optional($.method_specification)
    ),

    // --- Common Components for Structured/Distinct ---
    parameter_specification: $ => prec(1, choice(
        // Case 1: Just the type (UDT or Predefined)
        seq(
          choice(
            seq($._type, optional(seq($.keyword_character, $.keyword_set, $.identifier))),
            $.object_reference
          ),
          optional(seq($.keyword_as, $.keyword_locator))
        ),
        // Case 2: Name followed by the type
        seq(
          field('name', $.identifier),
          choice(
            seq($._type, optional(seq($.keyword_character, $.keyword_set, $.identifier))),
            $.object_reference
          ),
          optional(seq($.keyword_as, $.keyword_locator))
        )
      ),
    ),

    returns_parameter_specification: $ => prec(2, seq(
      choice(
        seq($._type, optional(seq($.keyword_character, $.keyword_set, $.identifier))),
        $.object_reference
      ),
      optional(seq($.keyword_as, $.keyword_locator))
     )
    ),

    language_and_access_specification: $ => choice(
      seq($.keyword_language, choice($.keyword_c, $.keyword_cpp)),
      seq($.keyword_no, $.keyword_sql),
    ),

    type_attribute: $ => choice(
      seq($.keyword_specific, $.object_reference),
      seq($.keyword_parameter, $.keyword_style, choice($.keyword_sql, $.keyword_td_general)),
      seq(optional($.keyword_not), $.keyword_deterministic),
      seq($.keyword_called, $.keyword_on, $.keyword_null, $.keyword_input),
      seq($.keyword_returns, $.keyword_null, $.keyword_on, $.keyword_null, $.keyword_input)
    ),

    // --- Array / Varray Form ---
    _type_array_form: $ => choice(
      // Form 1: data_type ARRAY [ size ]
      seq(
        $._type,
        $.keyword_array,
        repeat1( seq('[',
        $._array_bounds,
        ']')
        ),
        optional($._default_null)
      ),
      // Form 2: {VARYING ARRAY | VARRAY} ( size ) OF data_type
      seq(
        choice(seq($.keyword_varying, $.keyword_array), $.keyword_varray),
        repeat1(wrapped_in_parenthesis($._array_bounds)),
        $.keyword_of,
        $._type,
        optional($._default_null)
      )
    ),

    _array_bounds: $ => choice(
      seq(field('lower', $._integer), ':', field('upper', $._integer)),
      field('max_size', $._integer)
    ),


    storage_location: $ => prec.right(
        seq(
            $.keyword_location,
            field('path', alias($._literal_string, $.literal)),
            optional(
                seq(
                    $.keyword_cached,
                    $.keyword_in,
                    field('pool', alias($._literal_string, $.literal)),
                    optional(
                        choice(
                            $.keyword_uncached,
                            seq(
                                $.keyword_with,
                                $.keyword_replication,
                                '=',
                                field('value', alias($._natural_number, $.literal)),
                            ),
                        ),
                    ),
                )
            )
        ),
    ),

    row_format: $ => seq(
        $.keyword_row,
        $.keyword_format,
        $.keyword_delimited,
        optional(
            seq(
                $.keyword_fields,
                $.keyword_terminated,
                $.keyword_by,
                field('fields_terminated_char', alias($._literal_string, $.literal)),
                optional(
                    seq(
                        $.keyword_escaped,
                        $.keyword_by,
                        field('escaped_char', alias($._literal_string, $.literal)),
                    )
                )
            )
        ),
        optional(
            seq(
                $.keyword_lines,
                $.keyword_terminated,
                $.keyword_by,
                field('row_terminated_char', alias($._literal_string, $.literal)),
            )
        )
    ),

    table_sort: $ => seq(
        $.keyword_sort,
        $.keyword_by,
        paren_list($.identifier, true),
    ),

    table_partition: $ => seq(
      choice(
        // Postgres/MySQL style
        seq(
          $.keyword_partition,
          $.keyword_by,
          choice(
            $.keyword_range,
            $.keyword_hash,
          )
        ),
        // Hive style
        seq(
          $.keyword_partitioned,
          $.keyword_by,
        ),
        // Spark SQL
        $.keyword_partition,
      ),
      choice(
        paren_list($.identifier),// postgres & Impala (CTAS)
        $.column_definitions, // impala/hive external tables
        paren_list($._key_value_pair, true), // Spark SQL
      )
    ),

    _key_value_pair: $ => seq(
      field('key',$.identifier),
      '=',
      field('value', alias($._literal_string, $.literal)),
    ),

    assignment: $ => seq(
      field('left',
        alias(
          $._qualified_field,
          $.field,
        ),
      ),
      '=',
      field('right', $._expression),
    ),

    pre_table_option_spec: $ =>
      choice(
        seq($.keyword_map, '=', $.literal, optional(seq($.keyword_colocate, $.keyword_using, $.literal))),
        seq(optional($.keyword_no), $.keyword_fallback, optional($.keyword_protection)),
        $.keyword_queue,
        seq($.keyword_with, $.keyword_journal, $.keyword_table, '=', $.literal),
        seq(optional($.keyword_no), $.keyword_log),
        seq(optional(choice($.keyword_no, $.keyword_dual)), optional($.keyword_before), $.keyword_journal),
        seq(optional(choice($.keyword_no, $.keyword_dual, seq(optional($.keyword_not), $.keyword_local))), $.keyword_after, $.keyword_journal),
        seq($.keyword_checksum, '=', choice($.keyword_default, $.keyword_on, $.keyword_off)),
        seq($.keyword_freespace, '=', $._integer, optional($.keyword_percent)),
        seq(choice(
                  seq($.keyword_default, $.keyword_mergeblockratio),
                  seq($.keyword_mergeblockratio, '=', $._integer, optional($.keyword_percent)),
                  seq($.keyword_no, $.keyword_mergeblockratio),
                  )
            ),
        choice(seq($.keyword_datablocksize, '=', $.float, choice($.keyword_bytes, $.keyword_kbytes, $.keyword_kilobytes)),
          seq(choice($.keyword_minimum, $.keyword_maximum, $.keyword_default), $.keyword_datablocksize)),
        seq($.keyword_blockcompression, '=', choice($.keyword_autotemp, $.keyword_manual, $.keyword_always, $.keyword_never, $.keyword_default),
         optional(seq($.keyword_blockcompressionalgorithm, '=', choice($.keyword_zlib, $.keyword_elzs_h, $.keyword_default))),
         optional(seq($.keyword_blockcompressionlevel, '=', choice($._integer, $.keyword_default)))),
         seq($.keyword_with, optional($.keyword_no), optional($.keyword_concurrent), $.keyword_isolated, $.keyword_loading, optional(seq($.keyword_for, choice($.keyword_all, $.keyword_insert, $.keyword_none)))),
  )
    ,

    pre_table_option: $ => seq(','
      , comma_list($.pre_table_option_spec, true)),

    table_option: $ => choice(
      seq($.keyword_default, $.keyword_character, $.keyword_set, $.identifier),
      seq($.keyword_collate, $.identifier),
      field('name', $.keyword_default),
      seq(
        field('name', choice($.identifier, $._literal_string)),
        '=',
        field('value', choice($.identifier, $._literal_string)),
      ),
    ),

_index_column_list: $ => wrapped_in_parenthesis(
  seq(
    field('value', $._expression),
    repeat(seq(',', field('value', $._expression)))
  )
),

index_order_by_clause: $ => seq(
  $.keyword_order,
  $.keyword_by,
  optional(choice($.keyword_values, $.keyword_hash)),
  optional(wrapped_in_parenthesis($._expression)),
),

index_load_identity_clause: $ => seq(
  $.keyword_with,
  optional($.keyword_no),
  $.keyword_loading,
  $.keyword_identity,
),

primary_index_clause: $ => choice(
  seq(
    optional($.keyword_unique),
    $.keyword_primary,
    $.keyword_index,
    optional($.object_reference),
    $._index_column_list,
  ),
  seq(
    $.keyword_primary,
    $.keyword_amp,
    optional($.keyword_index),
    optional($.object_reference),
    $._index_column_list,
  ),
),

  index_clause: $ => choice(
  prec.right(seq(
    $.keyword_unique,
    $.keyword_index,
    optional($.object_reference),
    optional($._index_column_list),
    optional($.index_load_identity_clause),
  )),
  prec.right(seq(
    $.keyword_index,
    optional($.object_reference),
    optional($.keyword_all),
    $._index_column_list,
    optional($.index_order_by_clause),
    optional($.index_load_identity_clause),
  )),
),

      partition_by_clause: $ => seq(
        $.keyword_partition,
        $.keyword_by,
        choice(
          wrapped_in_parenthesis(
            seq(
              field('partition_expression', $._expression),
              repeat(prec.left(1, seq(
                ',',
                field('partition_expression', $._expression)
              )))
            ),
          ),
          field('partition_expression', $._expression),
          $.keyword_column,
        )
      ),

    column_definitions: $ => wrapped_in_parenthesis(
       seq(
        comma_list($.column_definition, true),
        optional($.constraints),
      )
    ),

    column_definition: $ => seq(
      choice($._derived_period,
        field('name', $._column)),
      field('type', $._type),
      repeat($._column_constraint),
    ),

    _format_column_constraint: $ => seq($.keyword_format, $._literal_string),
    _compress_column_constraint: $ =>
        seq($.keyword_compress,
            optional(choice(
              $._integer,
              $._decimal_number,
              $._literal_string,
              wrapped_in_parenthesis(
                  comma_list(
                    choice(
                      $._integer,
                      $._decimal_number,
                      $._literal_string,
                      $.keyword_null,
                    )
                  , true))
              )
            )
      ),

    _character_set_column_constraint: $ => seq($.keyword_character, $.keyword_set, $.object_reference),

    _title_column_constraint: $ => seq($.keyword_title, $.literal),

    _derived_period: $ => seq($.keyword_period, $.keyword_for,
          field('name', seq($._column, '(', $._column, ',', $._column, ')')),
          ),

    _column_comment: $ => seq(
      $.keyword_comment,
      alias($._literal_string, $.literal)
    ),

    _column_constraint: $ => prec.left(choice(
      choice(
        $.keyword_null,
        $._not_null,
      ),
      seq(
        $.keyword_references,
        $.object_reference,
        paren_list($.identifier, true),
        repeat(
          seq(
            $.keyword_on,
            choice($._delete, $._update),
            choice(
              seq($.keyword_no, $.keyword_action),
              $.keyword_restrict,
              $.keyword_cascade,
              seq(
                $.keyword_set,
                choice($.keyword_null, $.keyword_default),
                  optional(paren_list($.identifier, true))
              ),
            ),
          ),
        ),
      ),
      $._title_column_constraint,
      $._format_column_constraint,
      $._compress_column_constraint,
      $._character_set_column_constraint,
      seq(optional($.keyword_not), $.keyword_casespecific),
      $._default_expression,
      $._primary_key,
      $.direction,
      $._column_comment,
      $._check_constraint,
      $._generated_identity,
      seq(
        $.keyword_as,
        $._expression,
      ),
      choice(
        $.keyword_stored,
        $.keyword_virtual,
      ),
      $.keyword_unique
    )),

    _check_constraint: $ => seq(
      optional(
        seq(
          $.keyword_constraint,
          $.literal
        )
      ),
      optional(seq($.keyword_current, $.keyword_transactiontime)),
      $.keyword_check,
      wrapped_in_parenthesis($.binary_expression)
    ),

   _generated_identity: $ => seq(
     $.keyword_generated,
     choice($.keyword_always, seq($.keyword_by, $.keyword_default)),
     $.keyword_as,
     $.keyword_identity,
     optional_parenthesis(
       repeat(
         choice(
           seq($.keyword_start, $.keyword_with, $._integer),
           seq($.keyword_increment, $.keyword_by, $._integer),
           seq($.keyword_minvalue, $._integer),
           seq($.keyword_maxvalue, $._integer),
           seq($.keyword_no, choice($.keyword_minvalue,$.keyword_maxvalue)),
           seq(optional($.keyword_no), $.keyword_cycle),
          )
        )
     )
    ),


    _default_expression: $ => seq(
      $.keyword_default,
      optional_parenthesis($._inner_default_expression),
    ),
    _inner_default_expression: $ => prec(1, choice(
        $.literal,
        $.list,
        $.cast,
        $.binary_expression,
        $.unary_expression,
        $.invocation,
        $.keyword_user,
        alias($.implicit_cast, $.cast),
     )
    ),

    constraints: $ => seq(
      ',',
      $.constraint,
      repeat(
        seq(',', $.constraint),
      ),
    ),

    constraint: $ => choice(
      $._constraint_literal,
      $._key_constraint,
      $._constraint_key_constraint,
      $._primary_key_constraint,
      $._check_constraint
    ),

    _constraint_literal: $ => seq(
      $.keyword_constraint,
      field('name', $.identifier),
      choice(
        seq(
          $._primary_key,
          $.ordered_columns,
        ),
        seq(
          $._check_constraint
        )
      )
    ),

    _primary_key_constraint: $ => seq(
      $._primary_key,
      $.ordered_columns,
    ),

    _constraint_key_constraint: $ => seq(
      $.keyword_constraint,
      field('name', $.identifier),
      optional(seq($.keyword_current, $.keyword_transactiontime)),
      choice(
          $.keyword_unique,
        seq(optional($.keyword_foreign), $.keyword_key),
        $.keyword_index,
      ),
      $.ordered_columns,
      optional(
        seq(
          $.keyword_references,
          $.object_reference,
          paren_list($.identifier, true),
          repeat(
            seq(
              $.keyword_on,
              choice($._delete, $._update),
              choice(
                seq($.keyword_no, $.keyword_action),
                $.keyword_restrict,
                $.keyword_cascade,
                seq(
                  $.keyword_set,
                  choice($.keyword_null, $.keyword_default),
                    optional(paren_list($.identifier, true))
                ),
              ),
            ),
          ),
        ),
      ),
    ),


    _key_constraint: $ => seq(
      choice(
        seq(
          $.keyword_unique,
          optional(
            choice(
              $.keyword_index,
              $.keyword_key,
              seq($.keyword_nulls, optional($.keyword_not), $.keyword_distinct),
            ),
          ),
        ),
        seq(optional($.keyword_foreign), $.keyword_key),
        $.keyword_index,
      ),
      optional(field('name', $.identifier)),
      $.ordered_columns,
      optional(
        seq(
          $.keyword_references,
          $.object_reference,
          paren_list($.identifier, true),
          repeat(
            seq(
              $.keyword_on,
              choice($._delete, $._update),
              choice(
                seq($.keyword_no, $.keyword_action),
                $.keyword_restrict,
                $.keyword_cascade,
                seq(
                  $.keyword_set,
                  choice($.keyword_null, $.keyword_default),
                    optional(paren_list($.identifier, true))
                ),
              ),
            ),
          ),
        ),
      ),
    ),

    ordered_columns: $ => paren_list(alias($.ordered_column, $.column), true),

    ordered_column: $ => seq(
      field('name', $._column),
      optional($.direction),
    ),

};
