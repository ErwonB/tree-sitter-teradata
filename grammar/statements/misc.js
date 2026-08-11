const { wrapped_in_parenthesis, comma_list } = require('../helpers.js');

module.exports = {

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

  isolated_loading_clause: $ => seq(
    $.keyword_with,
    optional($.keyword_no),
    $.keyword_concurrent,
    $.keyword_isolated,
    $.keyword_loading,
  ),

  using_request_modifier: $ => seq(
    $.keyword_using,
    wrapped_in_parenthesis(comma_list($.using_variable, true)),
  ),

  using_variable: $ => seq(
    field('name', $.identifier),
    $._type,
    optional(seq(
      $.keyword_as,
      choice(
        seq($.keyword_deferred, optional(seq($.keyword_by, $.keyword_name))),
        $.keyword_locator,
      ),
    )),
  ),

};
