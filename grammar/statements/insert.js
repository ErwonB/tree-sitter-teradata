const { comma_list, paren_list } = require('../helpers.js');

module.exports = {

  _insert_statement: $ => seq(
    optional($.keyword_nontemporal),
    $.insert,
  ),

  insert: $ => seq(
    choice(
      $._insert,
      $.keyword_replace
    ),
    optional($.keyword_ignore),
    optional(
      choice(
        $.keyword_into,
        $.keyword_overwrite, // Spark SQL
      ),
    ),
    $.object_reference,
    optional($.table_partition), // Spark SQL
    optional(
      seq(
        $.keyword_as,
        field('alias', $.identifier)
      ),
    ),
    // TODO we need a test for `insert...set`
    choice(
      $._insert_values,
      $._set_values,
    ),
    optional(
      choice(
        $._on_duplicate_key_update,
      ),
    ),
  ),

  _on_duplicate_key_update: $ => seq(
    $.keyword_on,
    $.keyword_duplicate,
    $.keyword_key,
    $._update,
    $.assignment_list,
  ),

  assignment_list: $ => seq(
    $.assignment,
    repeat(seq(',', $.assignment)),
  ),

  _insert_values: $ => seq(
    optional(alias($._column_list, $.list)),
    choice(
      seq(
        $.keyword_values,
        comma_list($.list, true),
      ),
      $._dml_read,
    ),
  ),

  _set_values: $ => seq(
    $.keyword_set,
    comma_list($.assignment, true),
  ),

  _column_list: $ => paren_list(alias($._column, $.column), true),
  _column: $ => choice(
    $.identifier,
    alias($._literal_string, $.literal),
  ),

};
