module.exports = {

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

};
