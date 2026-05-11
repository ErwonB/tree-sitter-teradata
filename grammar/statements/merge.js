const { optional_parenthesis, paren_list } = require('../helpers.js');

module.exports = {

  _merge_statement: $=> seq(
    optional($.lock_clause),
    $.keyword_merge,
    optional($.keyword_into),
    $.object_reference,
    optional($._alias),
    $.keyword_using,
    choice(
      $.subquery,
      $.object_reference
    ),
    optional($._alias),
    $.keyword_on,
    optional_parenthesis(field("predicate", $._expression)),
    repeat1($.when_clause)
  ),

  when_clause: $ => seq(
    $.keyword_when,
    optional($.keyword_not),
    $.keyword_matched,
    optional(
      seq(
        $.keyword_and,
        optional_parenthesis(field("predicate", $._expression))
      )
    ),
    $.keyword_then,
    choice(
      $._delete,
      seq(
        $._update,
        $._set_values,
      ),
      seq(
        $._insert,
        $._insert_values
      ),
      optional($.where)
    )
  ),

  // TODO: this does not account for partitions specs like
  // (partcol1='2022-01-01', hr=11)
  // the second argument is not a $.table_option
  _partition_spec: $ => seq(
    $.keyword_partition,
    paren_list($.table_option, true),
  ),

};
