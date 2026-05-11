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

};
