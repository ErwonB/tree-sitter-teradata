module.exports = {

    create_function: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_function,
      $.object_reference,
      $.function_arguments,
      $.keyword_returns,
      choice(
        $._type,
        seq($.keyword_table, $.column_definitions),
      ),
      repeat(
        choice(
          $.function_language,
          $.function_sql_data_access,
          $.function_security,
          $.function_mandatory,
          $.function_strictness,
          $.function_deterministic,
          $.function_specific,
          $.function_parameter_style,
        ),
      ),
      $.function_body,
    ),

    _function_return: $ => seq(
      $.keyword_return,
      $._expression,
    ),

    function_body: $ => choice(
      seq($._function_return, ';'),
      $.function_external_name,
    ),

    function_external_name: $ => seq(
      $.keyword_external,
      $.keyword_name,
      alias($._literal_string, $.literal),
    ),

    function_language: $ => seq(
      $.keyword_language,
      $.identifier,
    ),

    function_sql_data_access: $ => choice(
      seq($.keyword_contains, $.keyword_sql),
      seq($.keyword_modifies, $.keyword_sql, $.keyword_data),
      seq($.keyword_reads, $.keyword_sql, $.keyword_data),
      seq($.keyword_no, $.keyword_sql),
    ),

    function_security: $ => seq(
      $.keyword_sql,
      $.keyword_security,
      choice(
        $.keyword_creator,
        $.keyword_definer,
        $.keyword_invoker,
        $.keyword_owner,
      ),
    ),

    function_mandatory: $ => choice(
      seq($.keyword_collation, $.keyword_invoker),
      seq($.keyword_inline, $.keyword_type, '1'),
    ),

    function_deterministic: $ => seq(
      optional($.keyword_not),
      $.keyword_deterministic,
    ),

    function_strictness: $ => seq(
      choice(
        $.keyword_called,
        seq($.keyword_returns, $.keyword_null),
      ),
      $.keyword_on,
      $.keyword_null,
      $.keyword_input,
    ),

    // SPECIFIC [database.]function_name
    function_specific: $ => seq(
      $.keyword_specific,
      $.object_reference,
    ),

    // PARAMETER STYLE { SQL | TD_GENERAL | JAVA }
    function_parameter_style: $ => seq(
      $.keyword_parameter,
      $.keyword_style,
      choice($.keyword_sql, $.keyword_td_general, $.keyword_java),
    ),

};
