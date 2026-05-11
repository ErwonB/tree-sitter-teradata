const { comma_list, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

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

};
