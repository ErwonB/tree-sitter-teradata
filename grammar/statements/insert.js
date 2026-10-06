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
    optional($.logging_errors_clause),
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

  // LOGGING [ALL] ERRORS [WITH {NO LIMIT | LIMIT OF n}]
  logging_errors_clause: $ => seq(
    $.keyword_logging,
    optional($.keyword_all),
    $.keyword_errors,
    optional(seq(
      $.keyword_with,
      choice(
        seq($.keyword_no, $.keyword_limit),
        seq(
          $.keyword_limit,
          $.keyword_of,
          field('error_limit', alias($._integer, $.literal)),
        ),
      ),
    )),
  ),

  // INSERT EXPLAIN [stats options] INTO qcd [AS name] [LIMIT ...] [FOR n] [CHECK STATISTICS] <dml>
  insert_explain: $ => seq(
    $._insert,
    $.keyword_explain,
    optional($._insert_explain_stats),
    $.keyword_into,
    field('qcd', $.object_reference),
    optional(seq(
      $.keyword_as,
      field('query_plan_name', choice($.identifier, alias($._literal_string, $.literal))),
    )),
    optional(seq(
      $.keyword_limit,
      optional(seq(
        $.keyword_sql,
        optional(seq('=', field('limit_value', alias($._integer, $.literal)))),
      )),
    )),
    optional(seq(
      $.keyword_for,
      field('frequency', alias($._integer, $.literal)),
    )),
    optional(seq($.keyword_check, $._stats)),
    choice($._dml_read, $._dml_write),
  ),

  _insert_explain_stats: $ => choice(
    // WITH NO STATISTICS [FOR table [,...]]
    seq(
      $.keyword_with, $.keyword_no, $._stats,
      optional($._insert_explain_for_tables),
    ),
    // WITH STATISTICS [USING SAMPLE [n PERCENT]] [AND DEMOGRAPHICS] [FOR table [,...]]
    seq(
      $.keyword_with, $._stats,
      optional(seq(
        $.keyword_using,
        $.keyword_sample,
        optional(seq(
          field('sample_percent', alias($._integer, $.literal)),
          $.keyword_percent,
        )),
      )),
      optional(seq($.keyword_and, $.keyword_demographics)),
      optional($._insert_explain_for_tables),
    ),
  ),

  _insert_explain_for_tables: $ => seq(
    $.keyword_for,
    comma_list($.object_reference, true),
  ),

};
