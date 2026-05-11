const { paren_list } = require('../helpers.js');

module.exports = {

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

};
