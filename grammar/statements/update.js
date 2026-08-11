const { comma_list } = require('../helpers.js');

module.exports = {

  _update_statement: $ => seq(
    optional($.keyword_nontemporal),
    $.update,
  ),

  update: $ => seq(
    $._update,
    optional($.isolated_loading_clause),
    choice(
      $._mysql_update_statement,
      $._postgres_update_statement,
      $._teradata_update_statement,
    ),
  ),

  // Teradata: the statement ends with either WHERE or ALL, never both.
  _update_qualifier: $ => choice(
    $.where,
    $.keyword_all,
  ),

  _teradata_update_statement: $ => prec(0,
    seq(
      $.object_reference,
      $.keyword_from,
      comma_list($.relation, true),
      repeat($.join),
      $._set_values,
      optional($._update_qualifier),
    ),
  ),

  _mysql_update_statement: $ => prec(1,
    seq(
      comma_list($.relation, true),
      repeat($.join),
      $._set_values,
      optional($._update_qualifier),
    ),
  ),

  _postgres_update_statement: $ => prec(2,
    seq(
      $.relation,
      $._set_values,
      optional($.from),
    ),
  ),

};
