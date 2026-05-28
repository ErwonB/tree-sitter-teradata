module.exports = {

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

  rename_object: $ => seq(
    $.keyword_rename,
    $.keyword_to,
    $.object_reference,
  ),

};
