module.exports = {

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

};
