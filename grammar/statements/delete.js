const { comma_list } = require('../helpers.js');

module.exports = {

  _delete_statement: $ => seq(
    optional($.keyword_nontemporal),
    choice(
      seq(
        $.delete,
        $.object_reference,
        optional($.where)
      ),
      seq(
        $.delete,
        optional(field('alias', $.object_reference)),
        alias($._delete_from, $.from),
      ),
    ),
  ),

  _delete_from: $ => seq(
    $.keyword_from,
    comma_list($.relation, true),
    optional($.where),
    optional($.order_by),
  ),

  delete: $ => seq(
    $._delete,
    optional($.index_hint),
  ),

};
