module.exports = {

  _unload_statement: $ => seq(
    $.keyword_unload,
    $.object_reference,
    $.keyword_file,
    '=',
    $.literal
  ),

};
