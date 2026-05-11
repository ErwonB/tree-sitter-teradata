const { comma_list, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

  _copy_statement: $ => seq(
    $.keyword_copy,
      choice(
        $.keyword_data,
        $.keyword_dictionary,
        $.keyword_journal,
        seq($.keyword_no, $.keyword_fallback)
      ),
      choice(
        $.keyword_table,
        $.keyword_tables
      ),
    choice(
      seq($.keyword_all, $.keyword_from, $.keyword_archive),
      comma_list(
        seq(
          wrapped_in_parenthesis($.object_reference),
            optional(wrapped_in_parenthesis(comma_list($.copy_table_options, true)))
          )
      , true)
    ),
    optional(seq(',' , comma_list($.copy_options, true)))
  ),

  copy_table_options: $ => choice(
    seq($.keyword_from, wrapped_in_parenthesis($.object_reference)),
    seq($.keyword_no, $.keyword_fallback),
    seq($.keyword_no, $.keyword_journal),
    seq($.keyword_with, $.keyword_journal, $.keyword_table, '=', wrapped_in_parenthesis($.object_reference)),
    seq($.keyword_apply, $.keyword_to, wrapped_in_parenthesis(comma_list($.object_reference, true))),
    seq($.keyword_replace, $.keyword_creator),
    seq($.keyword_exclude, $.keyword_tables, wrapped_in_parenthesis(comma_list($.object_reference, true))),
    seq($.keyword_all, $.keyword_partitions),
    seq($.keyword_qualified, $.keyword_partitions),
    seq($.keyword_errordb, $.object_reference),
    seq($.keyword_error, $.keyword_tables, $.object_reference),
    seq($.keyword_partitions, $.keyword_where, wrapped_in_parenthesis(seq('!', $._expression, '!'))),
    seq($.keyword_log, $.keyword_where, wrapped_in_parenthesis(seq('!', $._expression, '!'))),
  ),

  copy_options: $ => choice(
    seq(
      $.keyword_exclude,
      comma_list(
        choice(
          wrapped_in_parenthesis($.object_reference),
          seq(wrapped_in_parenthesis($.object_reference), $.keyword_to, wrapped_in_parenthesis($.object_reference))
        )
      )
    ),
    seq($.keyword_cluster, '=', $._integer),
    seq($.keyword_clusters, '=', $._integer),
    $.keyword_abort,
    seq($.keyword_no, $.keyword_build),
    seq($.keyword_amp, '=', $._integer),
    seq($.keyword_release, $.keyword_lock),
    seq($.keyword_skip, $.keyword_join, $.keyword_index),
    seq($.keyword_skip, $.keyword_stat, $.keyword_collection),
    seq($.keyword_file, '=', choice($.literal, $.object_reference)),
  ),

};
