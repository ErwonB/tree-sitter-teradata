const {
  make_keyword,
  optional_parenthesis,
  wrapped_in_parenthesis,
  parametric_type,
  comma_list,
  paren_list,
} = require('./grammar/helpers.js');
const keyword_rules = require('./grammar/keywords.js');
const type_rules = require('./grammar/types.js');
const expression_rules = require('./grammar/expressions.js');

module.exports = grammar({
  name: 'sql',

  extras: $ => [
    /\s\n/,
    /\s/,
    $.comment,
    $.marginalia,
  ],


  externals: $ => [
  ],

  conflicts: $ => [
    [$.object_reference, $._qualified_field],
    [$.object_reference],
    [$.between_expression, $.period_expression, $.binary_expression],
    [$._expression_base, $.binary_expression],
    [$.copy_options]
  ],

  precedences: $ => [
    [
      'binary_is',
      'unary_not',
      'binary_exp',
      'binary_mod',
      'binary_times',
      'binary_plus',
      'unary_other',
      'binary_other',
      'binary_in',
      'binary_compare',
      'binary_relation',
      'pattern_matching',
      'between',
      'clause_connective',
      'clause_disjunctive',
    ],
  ],

  word: $ => $._identifier,

  rules: {
    program: $ => seq(
      // any number of transactions, statements, or blocks with a terminating ;
      repeat(
        seq(
          choice(
            seq(choice(
              $.transaction,
              $.statement,
              $.block,
            ),
            ';',
            ),
            seq($.bteq_statement, optional(';')),
          ),
        ),
      ),
      // optionally, a single statement without a terminating ;
      optional(
          $.statement,
      ),
    ),

    ...keyword_rules,


    ...type_rules,

    comment: _ => /--.*/,
    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment
    marginalia: _ => /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//,

    transaction: $ => seq(
      seq($.keyword_bt, ';'),
      repeat(
        choice(
          seq(
            $.statement,
            ';'
          ),
          seq($.bteq_statement, optional(';')),
        ),
      ),
      choice(
        $._commit,
        $._rollback,
      ),
    ),

    _commit: $ => seq(
      $.keyword_et,
    ),

    _rollback: $ => seq(
      choice(seq($.keyword_rollback, optional( $.keyword_transaction,)),
            $.keyword_abort),
    ),

    block: $ => seq(
      $.keyword_begin,
      optional(';'),
      repeat(
        seq(
          $.statement,
          ';'
        ),
      ),
      $.keyword_end,
    ),

    statement: $ => choice(
      seq(
        optional(seq(
          $.keyword_explain,
        )),
        choice(
          $._ddl_statement,
          seq(optional($.lock_clause), $._dml_write),
          optional_parenthesis($._dml_read),
        ),
      ),
      $._show_statement,
      $._collect_statement,
    ),

    _ddl_statement: $ => choice(
      $._create_statement,
      $._modify_statement,
      $._alter_statement,
      $._drop_statement,
      $._rename_statement,
      $._merge_statement,
      $._database_statement,
      $.comment_statement,
      $.set_statement,
      $.reset_statement,
    ),



  bteq_statement: $ => choice(
    $._bteq_if_statement,
    $._goto_statement,
    $._logon_statement,
    $._quit_statement,
    $._label_statement,
    $._bteq_set_statement,
    $._bteq_run_statement,
    $.keyword_dot_exit,
    $.keyword_dot_logoff
  ),

  _bteq_if_statement: $ => seq(
    $.keyword_dot_if,
    $._expression,
    $.keyword_then,
    $.bteq_statement,
  ),

  _bteq_run_statement: $ => seq(
    $.keyword_dot_run,
    $.keyword_file,
    '=',
    choice($.object_reference, $.literal),
    optional(seq($.keyword_skip, $._integer)),
  ),

  _bteq_set_statement: $ => seq(
    $.keyword_dot_set,
    choice($.keyword_defaults,
      $._bteq_set_errorlevel,
      seq($.object_reference, choice($.object_reference, $.literal))
      ),
  ),

  _bteq_set_errorlevel: $ => seq($.keyword_errorlevel, $._integer, $.keyword_severity, $._integer),

  _label_statement: $ => seq($.keyword_dot_label, $.object_reference),
  _goto_statement: $ => seq($.keyword_dot_goto, $.object_reference),
  _quit_statement: $ => seq($.keyword_dot_quit, $._integer),
  _logon_statement: $ => seq($.keyword_dot_logon, $.object_reference, '/', $.object_reference, ',' ,
                            choice(
                              seq(optional('\\'), $.keyword_dollar_tdwallet, wrapped_in_parenthesis($.object_reference)),
                              $.object_reference,
                            )
                          ),


    _cte: $ => seq(
        $.keyword_with,
        optional($.keyword_recursive),
        $.cte,
        repeat(
            seq(
              ',',
              $.cte,
            ),
        ),
    ),

    _dml_write: $ => seq(
      seq(
        optional(
          $._cte,
        ),
        choice(
          $._delete_statement,
          $._insert_statement,
          seq($._update_statement, optional($._else_insert_statement)),
          $._copy_statement,
          $._macro_statement,
          $._procedure_statement,
          $._abort_statement,
        ),
      ),
    ),

    _else_insert_statement: $ => seq($.keyword_else, $._insert_statement),

    _dml_read: $ => seq(
      optional($.lock_clause),
      optional(optional_parenthesis($._cte)),
      optional_parenthesis(
        choice(
          $._select_statement,
          $.set_operation,
          $._unload_statement,
        ),
      ),
    ),

    // UNLOAD [ database. ] table FILE = filepath [ f ] ;
    _unload_statement: $ => seq(
      $.keyword_unload,
      $.object_reference,
      $.keyword_file,
      '=',
      $.literal
    ),

    _show_statement: $ => seq(
      $.keyword_show,
      choice(
        $.keyword_table,
        $.keyword_view,
        $.keyword_macro,
        $.keyword_function,
        seq($.keyword_join, $.keyword_index),
        seq($._stats, $.keyword_on),
      ),
      $.object_reference,
    ),

    _collect_statement: $ => seq(
        $.keyword_collect,
        $._stats,
        choice(
          // Form: COLLECT STATS ON table COLUMN col
          seq(
            $.keyword_on, $.object_reference,
            $.keyword_column, field('value', $.object_reference)
          ),
          // Form: COLLECT STATS ON table COLUMN (col, col, ...)
          seq(
            $.keyword_on, $.object_reference,
            $.keyword_column, wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
          ),
          // Form: COLLECT STATS COLUMN (col,...) [, COLUMN (col,...)] ON table
          seq(
            $.keyword_column,
            choice(
              field('value', $.object_reference),
              wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
            ),
            repeat(seq(
              ',',
              $.keyword_column,
              choice(
                field('value', $.object_reference),
                wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
              ),
            )),
            $.keyword_on,
            $.object_reference,
          ),
        )
      ),

    cte: $ => seq(
      $.identifier,
      optional(paren_list(field("argument", $.identifier))),
      $.keyword_as,
      wrapped_in_parenthesis(
        alias(
          choice($._dml_read, $._dml_write),
          $.statement,
        ),
      ),
    ),

    set_operation: $ => seq(
      $._select_statement,
      repeat1(
        seq(
          field(
            "operation",
            choice(
              seq($.keyword_union, optional($.keyword_all)),
              $.keyword_except,
              $.keyword_intersect,
            ),
          ),
          $._select_statement,
        ),
      ),
    ),

    //TODO refactor optional($.where) properly
    _select_statement: $ => choice(
      optional_parenthesis(
        seq(
          optional($.temporal_modifier),
          $.select,
          optional(
            seq(
              $.keyword_into,
              $.select_expression,
            ),
          ),
          optional($.where),
        ),
      ),
      optional_parenthesis(
        seq(
          optional($.temporal_modifier),
          $.select,
          optional(
            seq(
              $.keyword_into,
              $.select_expression,
            ),
          ),
          $.from,
        ),
      ),
    ),

    comment_statement: $ => seq(
      $.keyword_comment,
      $.keyword_on,
      $._comment_target,
      choice($.keyword_is, $.keyword_as),
      choice(
        $.keyword_null,
        alias($._literal_string, $.literal),
      ),
    ),

    _argmode: $ => choice(
      $.keyword_in,
      $.keyword_out,
      $.keyword_inout,
      $.keyword_variadic,
      seq($.keyword_in, $.keyword_out),
    ),

    function_argument: $ => seq(
      optional($._argmode),
      optional($.identifier),
      $._type,
      optional(
        seq(
          choice($.keyword_default, '='),
          $.literal,
        ),
      ),
    ),

    function_arguments: $ => paren_list(
      $.function_argument,
      false,
    ),

    _comment_target: $ => choice(
      // TODO: access method
      // TODO: aggregate
      $.cast,
      // TODO: collation
      seq($.keyword_column, alias($._qualified_field, $.object_reference)),
      // TODO: constraint (on domain)
      // TODO: conversion
      seq($.keyword_database, $.identifier),
      // TODO: domain
      seq($.keyword_extension, $.object_reference),
      // TODO: event trigger
      // TODO: foreign data wrapper
      // TODO: foreign table
      seq($.keyword_function, $.object_reference, optional($.function_arguments)),
      seq($.keyword_index, $.object_reference),
      // TODO: large object
      // TODO: operator (|class|family)
      // TODO: policy
      // TODO: (procedural) language
      // TODO: procedure
      // TODO: publication
      seq($.keyword_role, $.identifier),
      // TODO: routine
      // TODO: rule
      seq($.keyword_sequence, $.object_reference),
      // TODO: server
      // TODO: statistics
      // TODO: subscription
      seq($.keyword_table, $.object_reference),
      // TODO: text search (configuration|dictionary|parser|template)
      // TODO: transform for
      seq($.keyword_trigger, $.identifier, $.keyword_on, $.object_reference),
      seq($.keyword_type, $.identifier),
      seq($.keyword_view, $.object_reference),
    ),

    select: $ => seq(
      $._select,
      choice(
        seq($.keyword_distinct, $.select_expression),
        seq($.top_clause, $.select_expression),
        $.select_expression
      ),
    ),

    temporal_modifier: $ => choice(seq(
          choice($.keyword_current, $.keyword_nonsequenced),
          choice($.keyword_transactiontime, $.keyword_validtime)
        ),
        seq(
          choice($.keyword_transactiontime, $.keyword_validtime),
          seq($.keyword_as, $.keyword_of, optional($.keyword_timestamp), $.literal)
        ),
        ),

    lock_clause: $ => choice(
      seq($._lock, $.keyword_row, $.keyword_for, choice($.keyword_read, $.keyword_write, $.keyword_access)),
        repeat1(
          seq($._lock, optional(choice($.keyword_table, $.keyword_view)), $.object_reference, $.keyword_for,
            choice($.keyword_read, $.keyword_write, $.keyword_access)),
          ),
      ),

    top_clause: $ => seq(
      $.keyword_top,
      field('top_value', alias($._integer, $.literal)),
      optional($.keyword_percent),
      optional(seq($.keyword_with, $.keyword_ties))
    ),

    sample_value: $ => comma_list(
                    choice(
                      $._integer,
                      $._decimal_number,
                      )
                      ,true
                    ),

    sample_clause: $ => seq(
    $.keyword_sample,
    optional(seq($.keyword_with, $.keyword_replacement)),
    optional(seq($.keyword_randomized, $.keyword_allocation)),
    choice( $.sample_value,
      seq(
          $.keyword_when,
          $._expression,
          $.keyword_then,
          $.sample_value,
          repeat(
            seq(
              $.keyword_when,
              $._expression,
              $.keyword_then,
              $.sample_value,
            )
          ),
        optional(
          seq(
            $.keyword_else,
            $.sample_value,
          )
        ),
        $.keyword_end,
      )
    )
  ),


    select_expression: $ => seq(
      $.term,
      repeat(
        seq(
          ',',
          $.term,
        ),
      ),
    ),

    term: $ => seq(
      field(
        'value',
        choice(
          $.all_fields,
          $._expression,
        ),
      ),
      optional($._alias),
    ),

    _delete_statement: $ => seq(
      optional($.keyword_nontemporal),
      choice(
        seq(
          $.delete,
          $.object_reference,
          optional($.where)
        ),
        seq(
          $.delete,
          optional(field('alias', $.object_reference)),
          alias($._delete_from, $.from),
        ),
      ),
    ),

    _delete_from: $ => seq(
      $.keyword_from,
      comma_list($.relation, true),
      optional($.where),
      optional($.order_by),
    ),

    delete: $ => seq(
      $._delete,
      optional($.index_hint),
    ),

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
                  $._temporary,
                  $.keyword_external,
                  $.keyword_multiset,
                  $.keyword_set,
                  $.keyword_volatile,
                  seq($.keyword_global, $.keyword_temporary),
                )
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

    reset_statement: $ => seq(
      $.keyword_reset,
      choice(
        $.object_reference,
        $.keyword_all,
        seq($.keyword_session, $.keyword_authorization),
        $.keyword_role,
      ),
    ),

    _transaction_mode: $ => seq(
      $.keyword_isolation,
      $.keyword_level,
      choice(
        $.keyword_serializable,
        seq($.keyword_repeatable, $.keyword_read),
        seq($.keyword_read, $.keyword_committed),
        seq($.keyword_read, $.keyword_uncommitted),
      ),
      choice(
        seq($.keyword_read, $.keyword_write),
        seq($.keyword_read),
      ),
      optional($.keyword_not),
      $.keyword_deferrable,
    ),

    set_statement: $ => seq(
      $.keyword_set,
      choice(
        seq(
          optional(choice($.keyword_session, $.keyword_local)),
          choice(
            seq(
              $.object_reference,
              choice($.keyword_to, '='),
              choice(
                $.literal,
                $.keyword_default,
                $.identifier,
                $.keyword_on,
                $.keyword_off,
                $.binary_expression,
              ),
            ),
            seq($.keyword_names, $.literal),
            seq($.keyword_time, $.keyword_zone, choice($.literal, $.keyword_local, $.keyword_default)),
            seq($.keyword_session, $.keyword_authorization, choice($.identifier, $.keyword_default)),
            seq($.keyword_role, choice($.identifier, $.keyword_none)),
          ),
        ),
        seq($.keyword_constraints, choice($.keyword_all, comma_list($.identifier, true)), choice($.keyword_deferred, $.keyword_immediate)),
        seq($.keyword_transaction, $._transaction_mode),
        seq($.keyword_transaction, $.keyword_snapshot, $._transaction_mode),
        seq($.keyword_session, $.keyword_characteristics, $.keyword_as, $.keyword_transaction, $._transaction_mode),
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

    //SQL_Data_Definition_Language_Syntax-172K.pdf
    create_procedure: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_procedure,
      $.object_reference,
      $.procedure_arguments,
      repeat(
        choice(
          $.procedure_security,
          $.procedure_dynamic,
          $.procedure_language_and_access_specification,
          $.procedure_parameter_style_specification,
          $.procedure_glop,
          $.procedure_external_security,
          $.procedure_external_name,
        ),
      ),
      $.procedure_body, //TODO
    ),

    procedure_body: $ => seq(
      $.compound_statement,
    ),

    compound_statement: $ => choice(
      seq(
        optional(seq($.object_reference, ':')),
        $.keyword_begin,
        repeat1($._create_procedure_statement),
        $.keyword_end,
      ),
    ),

    _create_procedure_statement: $ => seq(
      $._procedure_body_statement,
      ';'
    ),


    _procedure_body_statement: $ => choice(
      $.leave_statement,
      $.declare_statement,
      $.procedure_if_statement, //TODO ELSEIF
      $.procedure_for_statement,
      $.statement,
      $.compound_statement,
    ),

    procedure_for_statement: $ => seq(
      $.keyword_for, $.identifier, $.keyword_as,
      $.identifier, $.keyword_cursor, $.keyword_for,
      $.statement,
      $.keyword_do,
      repeat1($._create_procedure_statement),
      $.keyword_end, $.keyword_for
    ),

    procedure_if_statement: $ => seq(
      $.keyword_if, $._expression, $.keyword_then,
      repeat1($._create_procedure_statement),
      optional($.procedure_else_statement),
      $.keyword_end, $.keyword_if,
    ),

    procedure_else_statement: $ => seq(
      $.keyword_else,
      repeat1($._create_procedure_statement),
    ),

    leave_statement: $ => seq($.keyword_leave, $.identifier),

    declare_statement: $ => choice(
        seq($.keyword_declare, $.identifier, $._type),
        seq(
          $.keyword_declare,
          $.identifier,
          $.keyword_condition,
          $.keyword_for,
          choice($.keyword_sqlexception, $.keyword_sqlwarning, seq($.keyword_not, $.keyword_found), $.identifier, seq($.keyword_sqlstate, $._integer)),
        ),
        seq(
          $.keyword_declare,
          choice($.keyword_continue, $.keyword_exit),
          $.keyword_handler,
          $.keyword_for,
          choice($.keyword_sqlexception, $.keyword_sqlwarning, seq($.keyword_not, $.keyword_found), $.identifier, seq($.keyword_sqlstate, $._integer)),
          $.compound_statement,
        )
      ),


    procedure_external_name: $ => seq($.keyword_external, $.keyword_name, $.object_reference),
    procedure_external_security: $ => seq($.keyword_external, $.keyword_security, choice($.keyword_invoker, seq($.keyword_definer, $.object_reference))),
    procedure_glop: $ => seq($.keyword_using, $.keyword_glop, $.keyword_set, $.object_reference),
    procedure_dynamic: $ => seq($.keyword_dynamic, $.keyword_result, $.keyword_sets, $._integer),
    procedure_parameter_style_specification : $ => seq($.keyword_parameter, $.keyword_style, choice($.keyword_sql, $.keyword_td_general, $.keyword_java)),

    procedure_security: $ => seq(
      $.keyword_sql,
      $.keyword_security,
      choice($.keyword_invoker, $.keyword_definer, $.keyword_creator, $.keyword_owner),
    ),

    procedure_language_and_access_specification: $ => seq(
      seq($.keyword_language, choice(
            $.keyword_c,
            $.keyword_cpp,
            $.keyword_java)),
      repeat(choice(
              seq($.keyword_contains, $.keyword_sql),
              seq(choice($.keyword_modifies, $.keyword_reads),
                  $.keyword_sql, $.keyword_data),
              seq($.keyword_no, $.keyword_sql),
              )
            ),
      optional(seq(
                choice($.keyword_modifies, $.keyword_reads, $.keyword_no),
                $.keyword_external,
                $.keyword_data))
    ),

    _proc_argmode: $ => choice(
      $.keyword_in,
      $.keyword_out,
      $.keyword_inout,
    ),

    procedure_argument: $ => seq(
      $._argmode,
      $.identifier,
      $._type,
    ),

    procedure_arguments: $ => paren_list(
      $.procedure_argument,
      false,
    ),


    create_function: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_function,
      $.object_reference,
      $.function_arguments,
      $.keyword_returns,
      choice(
        $._type,
        seq($.keyword_setof, $._type),
        seq($.keyword_table, $.column_definitions),
        $.keyword_trigger,
      ),
      repeat(
        choice(
          $.function_language,
          $.function_volatility,
          $.function_security,
          $.function_mandatory,
          $.function_strictness,
          $.function_cost,
          $.function_rows,
          $.function_support,
          $.function_deterministic,
        ),
      ),
      // ensure that there's only one function body -- other specifiers are less
      // variable but the body can have all manner of conflicting stuff
      $.function_body,
      repeat(
        choice(
          $.function_language,
          $.function_volatility,
          $.function_security,
          $.function_mandatory,
          $.function_strictness,
          $.function_cost,
          $.function_rows,
          $.function_support,
          $.function_deterministic,
        ),
      ),
    ),

    _function_return: $ => seq(
      $.keyword_return,
      $._expression,
    ),

    _function_body_statement: $ => choice(
      $.statement,
      $._function_return,
    ),

    function_body: $ => choice(
      seq(
        $._function_return,
        ';'
      ),
      seq(
        $.keyword_begin,
        $.keyword_atomic,
        repeat1(
          seq(
            $._function_body_statement,
            ';',
          ),
        ),
        $.keyword_end,
      ),
      seq(
        $.keyword_as,
        alias(
          choice(
            $._single_quote_string,
            $._double_quote_string,
          ),
          $.literal
        ),
      ),
    ),

    function_language: $ => seq(
      $.keyword_language,
      $.identifier,
      optional(seq($.keyword_contains,
              $.identifier,))
    ),

    function_volatility: $ => choice(
      $.keyword_immutable,
      $.keyword_stable,
      $.keyword_volatile,
    ),

    function_security: $ => seq(
      optional($.keyword_external),
      optional($.keyword_sql),
      $.keyword_security,
      choice($.keyword_invoker, $.keyword_definer),
    ),

    function_mandatory: $ => seq(
      choice(
        seq($.keyword_collation, $.keyword_invoker),
        seq($.keyword_inline, $.keyword_type, '1')
      )
    ),

    function_deterministic: $ => seq(
      optional($.keyword_not),
      $.keyword_deterministic,
    ),

    function_strictness: $ => choice(
      seq(
        choice(
          $.keyword_called,
          seq(
            $.keyword_returns,
            $.keyword_null,
          ),
        ),
        $.keyword_on,
        $.keyword_null,
        $.keyword_input,
      ),
      $.keyword_strict,
    ),

    function_cost: $ => seq(
      $.keyword_cost,
      $._natural_number,
    ),

    function_rows: $ => seq(
      $.keyword_rows,
      $._natural_number,
    ),

    function_support: $ => seq(
      $.keyword_support,
      alias($._literal_string, $.literal),
    ),

    create_macro: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_macro,
      $.object_reference,
      optional(wrapped_in_parenthesis(comma_list($.column_definition))),
      $.keyword_as,
      '(',
        repeat1(
          seq(
            $.statement,
            ';'
          ),
        ),
       ')',
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

    _alter_statement: $ => seq(
      choice(
        $.alter_table,
        $.alter_type,
        $.alter_role,
      ),
    ),

    _rename_statement: $ => seq(
      $.keyword_rename,
      choice(
        $.keyword_table,
        $.keyword_tables,
      ),
      $.object_reference,
      optional(
        choice(
          $.keyword_nowait,
          seq(
            $.keyword_wait,
            field('timeout', alias($._natural_number, $.literal))
          )
        )
      ),
      $.keyword_to,
      $.object_reference,
      repeat(
        seq(
          ',',
          $._rename_table_names,
        )
      ),
    ),

    _rename_table_names: $ => seq(
      $.object_reference,
      $.keyword_to,
      $.object_reference,
    ),

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
      $.alter_column,
      $.modify_column,
      $.change_column,
      $.drop_column,
      $.rename_object,
      $.rename_column,
      $.change_ownership,
    ),

    // TODO: optional `keyword_add` is necessary to allow for chained alter statements in t-sql
    // maybe needs refactoring
    add_column: $ => seq(
      optional($.keyword_add),
      optional(
        $.keyword_column,
      ),
      $.column_definition,
    ),

    add_constraint: $ => seq(
      $.keyword_add,
      optional($.keyword_constraint),
      $.identifier,
      $.constraint,
    ),

    drop_constraint: $ => seq(
      $.keyword_drop,
      $.keyword_constraint,
      $.identifier,
      optional($._drop_behavior),
    ),

    alter_column: $ => seq(
      // TODO constraint management
      $.keyword_alter,
      optional(
        $.keyword_column,
      ),
      field('name', $.identifier),
      choice(
        seq(
          choice(
            $.keyword_set,
            $.keyword_drop,
          ),
          $.keyword_not,
          $.keyword_null,
        ),
        seq(
          optional(
            seq(
              $.keyword_set,
              $.keyword_data,
            ),
          ),
          $.keyword_type,
          field('type', $._type),
        ),
        seq(
          $.keyword_set,
          choice(
            seq(
              $.keyword_statistics,
              field('statistics', $._integer)
            ),
            seq(
              $.keyword_storage,
              choice(
                $.keyword_plain,
                $.keyword_external,
                $.keyword_extended,
                $.keyword_main,
                $.keyword_default,
              ),
            ),
            seq(
              $.keyword_compression,
              field('compression_method', $._identifier)
            ),
            seq(
              paren_list($._key_value_pair, true),
            ),
            seq(
              $.keyword_default,
              $._expression,
            ),
          )
        ),
        seq(
          $.keyword_drop,
          $.keyword_default,
        ),
      ),
    ),

    modify_column: $ => seq(
      $.keyword_modify,
      optional(
        $.keyword_column,
      ),
      $.column_definition,
    ),

    change_column: $ => seq(
      $.keyword_change,
      optional(
        $.keyword_column,
      ),
      field('old_name', $.identifier),
      $.column_definition,
    ),

    drop_column: $ => seq(
      $.keyword_drop,
      optional(
        $.keyword_column,
      ),
      field('name', $.identifier),
    ),

    rename_column: $ => seq(
      $.keyword_rename,
      optional(
        $.keyword_column,
      ),
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
      $.identifier,
      choice(
        $.change_ownership,
        $.rename_object,
        seq(
          $.keyword_rename,
          $.keyword_attribute,
          $.identifier,
          $.keyword_to,
          $.identifier,
          optional($._drop_behavior)
        ),
        seq(
          $.keyword_add,
          $.keyword_value,
            alias($._single_quote_string,$.literal),
          optional(
            seq(
              choice($.keyword_before, $.keyword_after),
              alias($._single_quote_string,$.literal),
            )
          ),
        ),
        seq(
          $.keyword_rename,
          $.keyword_value,
          alias($._single_quote_string,$.literal),
          $.keyword_to,
          alias($._single_quote_string,$.literal),
        ),
        seq(
          choice(
            seq(
              $.keyword_add,
              $.keyword_attribute,
              $.identifier,
              $._type
            ),
            seq($.keyword_drop,
              $.keyword_attribute,
              $.identifier),
            seq(
              $.keyword_alter,
              $.keyword_attribute,
              $.identifier,
              optional(seq($.keyword_set, $.keyword_data)),
              $.keyword_type,
              $._type
            ),
          ),
          optional(seq($.keyword_collate, $.identifier)),
          optional($._drop_behavior)
        )
      ),
    ),

    _drop_behavior: $ => choice(
      $.keyword_cascade,
      $.keyword_restrict,
    ),

    _drop_statement: $ => seq(
      choice(
        $.drop_table,
        $.drop_view,
        $.drop_index,
        $.drop_type,
        $.drop_database,
        $.drop_role,
        $.drop_sequence,
        $.drop_function,
        $.drop_macro,
        $.drop_stats,
        $.drop_join_index,
      ),
    ),

    drop_join_index: $ => seq(
      $.keyword_drop,
      $.keyword_join,
      $.keyword_index,
      $.object_reference,
    ),

    drop_stats: $ => seq(
      $.keyword_drop,
      $._stats,
      $.keyword_on,
      $.object_reference,
    ),

    drop_table: $ => seq(
      $.keyword_drop,
      $.keyword_table,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_view: $ => seq(
      $.keyword_drop,
      $.keyword_view,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_database: $ => seq(
      $.keyword_drop,
      $.keyword_database,
      $.identifier,
      optional($.keyword_with),
    ),

    drop_role: $ => seq(
      $.keyword_drop,
      choice(
        $.keyword_group,
        $.keyword_role,
        $.keyword_user,
      ),
      $.identifier,
    ),

    drop_type: $ => seq(
      $.keyword_drop,
      $.keyword_type,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_sequence: $ => seq(
      $.keyword_drop,
      $.keyword_sequence,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_index: $ => seq(
      $.keyword_drop,
      $.keyword_index,
      field("name", $.identifier),
      optional($._drop_behavior),
      optional(
        seq(
            $.keyword_on,
            $.object_reference,
        ),
      ),
    ),

    drop_function: $ => seq(
      $.keyword_drop,
      $.keyword_function,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_macro: $ => seq(
      $.keyword_drop,
      $.keyword_macro,
      $.object_reference,
    ),

    rename_object: $ => seq(
      $.keyword_rename,
      $.keyword_to,
      $.object_reference,
    ),

    change_ownership: $ => seq(
      $.keyword_owner,
      $.keyword_to,
      $.identifier,
    ),

    object_reference: $ => choice(
      seq(
        field('database', $.identifier),
        '.',
        field('schema', $.identifier),
        '.',
        field('name', $.identifier),
      ),
      seq(
        field('schema', choice($.identifier, alias($._interpolated_var, $.identifier))),
        '.',
        field('name', choice($.identifier, alias($._interpolated_var, $.identifier))),
      ),
      field('name', choice($.identifier, alias($._interpolated_var, $.identifier))),
    ),

      _copy_statement: $ => seq(
        $.keyword_copy,
          choice(
            $.keyword_data,
            $.keyword_dictionary,
            $.keyword_journal,
            seq($.keyword_no, $.keyword_fallback)
          ),
          choice(
            $.keyword_table,
            $.keyword_tables
          ),
        choice(
          seq($.keyword_all, $.keyword_from, $.keyword_archive),
          comma_list(
            seq(
              wrapped_in_parenthesis($.object_reference),
                optional(wrapped_in_parenthesis(comma_list($.copy_table_options, true)))
              )
          , true)
        ),
        optional(seq(',' , comma_list($.copy_options, true)))
  ),

  copy_table_options: $ => choice(
  	seq($.keyword_from, wrapped_in_parenthesis($.object_reference)),
  	seq($.keyword_no, $.keyword_fallback),
  	seq($.keyword_no, $.keyword_journal),
  	seq($.keyword_with, $.keyword_journal, $.keyword_table, '=', wrapped_in_parenthesis($.object_reference)),
  	seq($.keyword_apply, $.keyword_to, wrapped_in_parenthesis(comma_list($.object_reference, true))),
  	seq($.keyword_replace, $.keyword_creator),
  	seq($.keyword_exclude, $.keyword_tables, wrapped_in_parenthesis(comma_list($.object_reference, true))),
  	seq($.keyword_all, $.keyword_partitions),
  	seq($.keyword_qualified, $.keyword_partitions),
  	seq($.keyword_errordb, $.object_reference),
  	seq($.keyword_error, $.keyword_tables, $.object_reference),
  	seq($.keyword_partitions, $.keyword_where, wrapped_in_parenthesis(seq('!', $._expression, '!'))),
  	seq($.keyword_log, $.keyword_where, wrapped_in_parenthesis(seq('!', $._expression, '!'))),
  ),

  copy_options: $ => choice(
   seq(
   	$.keyword_exclude,
   	comma_list(
   		choice(
   			wrapped_in_parenthesis($.object_reference),
   			seq(wrapped_in_parenthesis($.object_reference), $.keyword_to,wrapped_in_parenthesis($.object_reference))
   		)
   	)
   ),
   seq($.keyword_cluster, '=', $._integer),
   seq($.keyword_clusters, '=', $._integer),
   $.keyword_abort,
   seq($.keyword_no, $.keyword_build),
   seq($.keyword_amp, '=', $._integer),
   seq($.keyword_release, $.keyword_lock),
   seq($.keyword_skip, $.keyword_join, $.keyword_index),
   seq($.keyword_skip, $.keyword_stat, $.keyword_collection),
   seq($.keyword_file, '=', choice($.literal, $.object_reference)),
  ),


    _insert_statement: $ => seq(
      optional($.keyword_nontemporal),
      $.insert,
    ),

    insert: $ => seq(
      choice(
        $._insert,
        $.keyword_replace
      ),
      optional($.keyword_ignore),
      optional(
        choice(
          $.keyword_into,
          $.keyword_overwrite, // Spark SQL
        ),
      ),
      $.object_reference,
      optional($.table_partition), // Spark SQL
      optional(
        seq(
          $.keyword_as,
          field('alias', $.identifier)
        ),
      ),
      // TODO we need a test for `insert...set`
      choice(
        $._insert_values,
        $._set_values,
      ),
      optional(
        choice(
          $._on_duplicate_key_update,
        ),
      ),
    ),

    _on_duplicate_key_update: $ => seq(
      $.keyword_on,
      $.keyword_duplicate,
      $.keyword_key,
      $._update,
      $.assignment_list,
    ),

    assignment_list: $ => seq(
      $.assignment,
      repeat(seq(',', $.assignment)),
    ),

    _insert_values: $ => seq(
      optional(alias($._column_list, $.list)),
      choice(
        seq(
          $.keyword_values,
          comma_list($.list, true),
        ),
        $._dml_read,
      ),
    ),

    _set_values: $ => seq(
      $.keyword_set,
      comma_list($.assignment, true),
    ),

    _column_list: $ => paren_list(alias($._column, $.column), true),
    _column: $ => choice(
      $.identifier,
      alias($._literal_string, $.literal),
    ),

    _update_statement: $ => seq(
      optional($.keyword_nontemporal),
      $.update,
    ),

    _macro_statement: $ => seq(
      $.macro,
    ),

    _procedure_statement: $ => seq(
      $.procedure,
    ),

    _abort_statement: $ => seq(
      $.abort,
    ),

    _database_statement: $ => seq(
      $.keyword_database,
      $.object_reference,
    ),

    _merge_statement: $=> seq(
      optional($.lock_clause),
      $.keyword_merge,
      optional($.keyword_into),
      $.object_reference,
      optional($._alias),
      $.keyword_using,
      choice(
        $.subquery,
        $.object_reference
      ),
      optional($._alias),
      $.keyword_on,
      optional_parenthesis(field("predicate", $._expression)),
      repeat1($.when_clause)
    ),

    when_clause: $ => seq(
      $.keyword_when,
      optional($.keyword_not),
      $.keyword_matched,
      optional(
        seq(
          $.keyword_and,
          optional_parenthesis(field("predicate", $._expression))
        )
      ),
      $.keyword_then,
      choice(
        $._delete,
        seq(
          $._update,
          $._set_values,
        ),
        seq(
          $._insert,
          $._insert_values
        ),
        optional($.where)
      )
    ),


    // TODO: this does not account for partitions specs like
    // (partcol1='2022-01-01', hr=11)
    // the second argument is not a $.table_option
    _partition_spec: $ => seq(
      $.keyword_partition,
      paren_list($.table_option, true),
    ),

    update: $ => seq(
      $._update,
      choice(
        $._mysql_update_statement,
        $._postgres_update_statement,
        $._teradata_update_statement,
      ),
    ),

    _teradata_update_statement: $ => prec(0,
      seq(
        $.object_reference,
        $.keyword_from,
        comma_list($.relation, true),
        repeat($.join),
        $._set_values,
        optional($.where),
      ),
      ),

    _mysql_update_statement: $ => prec(1,
      seq(
        comma_list($.relation, true),
        repeat($.join),
        $._set_values,
        optional($.where),
      ),
    ),

    _postgres_update_statement: $ => prec(2,
      seq(
        $.relation,
        $._set_values,
        optional($.from),
      ),
    ),

    macro: $ => seq(
      $._exec,
      field('macro', $.object_reference),
      optional(wrapped_in_parenthesis(
          comma_list($._expression),
        ),
      ),
    ),

    procedure: $ => seq(
      $.keyword_call,
      field('procedure', $.object_reference),
      optional(wrapped_in_parenthesis(
          comma_list($._expression),
        ),
      ),
    ),

    abort: $ => seq(
      $.keyword_abort,
      field('abort_message', alias($._literal_string, $.literal)),
      optional(choice($.where, $.from)),
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
        seq($.keyword_with, $.keyword_journal, $.keyword_table, '=', $.literal),
        seq(optional($.keyword_no), $.keyword_log),
        seq(choice($.keyword_no, $.keyword_dual), optional($.keyword_before), $.keyword_journal),
        seq(choice($.keyword_no, $.keyword_dual, seq(optional($.keyword_not), $.keyword_local)), $.keyword_after, $.keyword_journal),
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

      primary_index_clause:$ => seq(
        optional($.keyword_unique),
        $.keyword_primary,
        $.keyword_index,
        optional($.object_reference),
        '(',
          seq(
            field('value', $._expression),
            repeat(seq(',', field('value', $._expression)))
          ),
        ')',
      ),

      partition_by_clause: $ => seq(
        $.keyword_partition,
        $.keyword_by,
        '(',
        seq(
          field('partition_expression', $._expression),
          repeat(seq(
            ',',
            field('partition_expression', $._expression)
          ))
        ),
        ')'
      ),

    column_definitions: $ => seq(
      '(',
      comma_list($.column_definition, true),
      optional($.constraints),
      ')',
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
      seq(
        optional(seq($.keyword_generated, $.keyword_always)),
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

    ...expression_rules,

    from: $ => seq(
      $.keyword_from,
      comma_list($.relation, true),
      optional($.index_hint),
      repeat(
        choice(
          $.join,
          $.cross_join,
        ),
      ),
      optional($.pivot),
      optional($.where),
      optional($.group_by),
      optional($.having),
      optional($.window_clause),
      optional($.qualify),
      optional($.sample_clause),
      optional($.order_by),
    ),

    relation: $ => prec.right(
      seq(
        choice(
          $.subquery,
          $.table_function,
          $.invocation,
          $.object_reference,
          wrapped_in_parenthesis($.values),
        ),
        optional(
          seq(
            $._alias,
            optional(alias($._column_list, $.list)),
          ),
        ),
      ),
    ),

    values: $ => seq(
      $.keyword_values,
      $.list,
      optional(
          repeat(
          seq(
            ',',
            $.list,
          ),
        ),
      ),
    ),

    index_hint: $ => seq(
      choice(
        $.keyword_use,
        $.keyword_ignore,
      ),
      $.keyword_index,
      optional(
        seq(
          $.keyword_for,
          $.keyword_join,
        ),
      ),
      wrapped_in_parenthesis(
        field('index_name', $.identifier),
      ),
    ),

    join: $ => seq(
      optional(
        choice(
          $.keyword_left,
          seq($.keyword_full, $.keyword_outer),
          seq($.keyword_left, $.keyword_outer),
          $.keyword_right,
          seq($.keyword_right, $.keyword_outer),
          $.keyword_inner,
          $.keyword_full,
        ),
      ),
      $.keyword_join,
      $.relation,
      optional($.index_hint),
      optional($.join),
      choice(
        seq(
          $.keyword_on,
          field("predicate", $._expression),
        ),
        seq(
          $.keyword_using,
          alias($._column_list, $.list),
        )
      )
    ),

    cross_join: $ => prec.right(
      seq(
        $.keyword_cross,
        $.keyword_join,
        $.relation,
      )
    ),

    where: $ => seq(
      $.keyword_where,
      field("predicate", $._expression),
    ),


    pivot: $ => seq(
      $.keyword_pivot,
      wrapped_in_parenthesis($.pivot_body),
      optional($._alias)
    ),

    pivot_body: $ => seq(
      $.agg_list,
      $.keyword_for,
      $.for_columns,
      $.keyword_in,
      $.pivot_in,
      optional($.with_pivot)
    ),

    agg_function: $ => choice($.keyword_sum, $.keyword_avg, $.keyword_min, $.keyword_max),

    agg_call: $ => seq(
      $.agg_function,
      wrapped_in_parenthesis($.object_reference),
      optional($._alias)
    ),

    agg_list: $ => comma_list($.agg_call, true),

    for_columns: $ => choice(
      $.object_reference,
      wrapped_in_parenthesis(comma_list($.object_reference))
    ),

    pivot_in: $ => choice(
      wrapped_in_parenthesis($.pivot_in_values),
      wrapped_in_parenthesis($.pivot_in_tuples),
      $.subquery
    ),

    value_or_ref: $ => choice($.object_reference, $.literal),

    pivot_in_values: $ => comma_list(seq($.value_or_ref, optional($._alias)), true),

    tuple_value: $ => wrapped_in_parenthesis(comma_list($.value_or_ref), true),
    pivot_in_tuples: $ => comma_list($.tuple_value, true),

    with_pivot: $ => seq(
      $.keyword_with,
      $.agg_function,
      wrapped_in_parenthesis(comma_list($.value_or_ref)),
      optional($._alias)
    ),

    group_by: $ => seq(
      $.keyword_group,
      $.keyword_by,
      comma_list($._expression, true),
    ),

    having: $ => seq(
      $.keyword_having,
      $._expression,
    ),

    qualify: $ => seq(
      $.keyword_qualify,
      $._expression,
    ),

    order_by: $ => prec.right(seq(
      $.keyword_order,
      $.keyword_by,
      comma_list($.order_target, true),
    )),

    order_target: $ => seq(
      $._expression,
      optional(
        seq(
          choice(
            $.direction,
            seq(
              $.keyword_using,
              choice('<', '>', '<=', '>='),
            ),
          ),
          optional(
            seq(
              $.keyword_nulls,
              choice(
                $.keyword_first,
                $.keyword_last,
              ),
            ),
          ),
        ),
      ),
    ),


  }

});
