const { paren_list } = require('../helpers.js');

module.exports = {

  comment_statement: $ => seq(
    $.keyword_comment,
    $.keyword_on,
    $._comment_target,
    choice($.keyword_is, $.keyword_as),
    choice(
      $.keyword_null,
      alias($._literal_string, $.literal),
    ),
  ),

  _argmode: $ => choice(
    $.keyword_in,
    $.keyword_out,
    $.keyword_inout,
    $.keyword_variadic,
    seq($.keyword_in, $.keyword_out),
  ),

  function_argument: $ => seq(
    optional($._argmode),
    optional($.identifier),
    $._type,
    optional(
      seq(
        choice($.keyword_default, '='),
        $.literal,
      ),
    ),
  ),

  function_arguments: $ => paren_list(
    $.function_argument,
    false,
  ),

  _comment_target: $ => choice(
    // TODO: access method
    // TODO: aggregate
    $.cast,
    // TODO: collation
    seq($.keyword_column, alias($._qualified_field, $.object_reference)),
    // TODO: constraint (on domain)
    // TODO: conversion
    seq($.keyword_database, $.identifier),
    // TODO: domain
    seq($.keyword_extension, $.object_reference),
    // TODO: event trigger
    // TODO: foreign data wrapper
    // TODO: foreign table
    seq($.keyword_function, $.object_reference, optional($.function_arguments)),
    seq($.keyword_index, $.object_reference),
    // TODO: large object
    // TODO: operator (|class|family)
    // TODO: policy
    // TODO: (procedural) language
    // TODO: procedure
    // TODO: publication
    seq($.keyword_role, $.identifier),
    // TODO: routine
    // TODO: rule
    seq($.keyword_sequence, $.object_reference),
    // TODO: server
    // TODO: statistics
    // TODO: subscription
    seq($.keyword_table, $.object_reference),
    // TODO: text search (configuration|dictionary|parser|template)
    // TODO: transform for
    seq($.keyword_trigger, $.identifier, $.keyword_on, $.object_reference),
    seq($.keyword_type, $.identifier),
    seq($.keyword_view, $.object_reference),
  ),

};
