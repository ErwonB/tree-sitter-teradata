const { wrapped_in_parenthesis } = require('./helpers.js');

module.exports = {

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

};
