const { comma_list, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

  _collect_statement: $ => choice(
    $._collect_optimizer_form,
    $._collect_legacy_form,
  ),

  // ------------------------------------------------------------------
  // Optimizer Form
  // ------------------------------------------------------------------
  _collect_optimizer_form: $ => prec.right(seq(
    $.keyword_collect,
    optional($.keyword_summary),
    $._stats,
    optional($.collect_using_clause),
    optional(comma_list($._collect_target, true)),
    $.keyword_on,
    $._collection_source,
    optional($.collect_from_clause),
  )),

  // ------------------------------------------------------------------
  // Legacy Form: COLLECT STATS ON tab COLUMN ...
  // ------------------------------------------------------------------
  _collect_legacy_form: $ => prec.right(seq(
    $.keyword_collect,
    $._stats,
    $.keyword_on,
    $._collection_source,
    $.keyword_column,
    $._legacy_column_value,
    repeat(seq(
      ',',
      $.keyword_column,
      $._legacy_column_value,
    )),
  )),

  _legacy_column_value: $ => choice(
    $.keyword_partition,
    wrapped_in_parenthesis(
      comma_list(
        choice($.keyword_partition, field('value', $.object_reference)),
        true,
      ),
    ),
    field('value', $.object_reference),
  ),

  // ------------------------------------------------------------------
  // USING clause
  // ------------------------------------------------------------------
  collect_using_clause: $ => seq(
    $.keyword_using,
    $.collect_using_option,
    repeat(seq(
      $.keyword_and,
      $.collect_using_option,
    )),
  ),

  collect_using_option: $ => seq(
    choice(
      // SAMPLE n PERCENT
      seq(
        $.keyword_sample,
        field('sample_value', alias($._integer, $.literal)),
        $.keyword_percent,
      ),
      // SYSTEM SAMPLE
      seq($.keyword_system, $.keyword_sample),
      // NO SAMPLE
      seq($.keyword_no, $.keyword_sample),
      // SAMPLE
      $.keyword_sample,

      // SYSTEM THRESHOLD [PERCENT | DAYS]
      seq(
        $.keyword_system, $.keyword_threshold,
        optional(choice($.keyword_percent, $.keyword_days)),
      ),
      // THRESHOLD n [PERCENT | DAYS]
      seq(
        $.keyword_threshold,
        field('threshold_value', alias($._integer, $.literal)),
        optional(choice($.keyword_percent, $.keyword_days)),
      ),
      // NO THRESHOLD [PERCENT | DAYS]
      seq(
        $.keyword_no, $.keyword_threshold,
        optional(choice($.keyword_percent, $.keyword_days)),
      ),

      // MAXINTERVALS n
      seq(
        $.keyword_maxintervals,
        field('maxintervals_value', alias($._integer, $.literal)),
      ),
      // SYSTEM MAXINTERVALS
      seq($.keyword_system, $.keyword_maxintervals),

      // MAXVALUELENGTH n
      seq(
        $.keyword_maxvaluelength,
        field('maxvaluelength_value', alias($._integer, $.literal)),
      ),
      // SYSTEM MAXVALUELENGTH
      seq($.keyword_system, $.keyword_maxvaluelength),
    ),
    optional(seq($.keyword_for, $.keyword_current)),
  ),

  // ------------------------------------------------------------------
  // Targets: [UNIQUE] INDEX index_spec | COLUMN column_spec
  // Inlined (not wrapped) to match the project's flat-tree style.
  // ------------------------------------------------------------------
  _collect_target: $ => choice(
    $._collect_index_target,
    $._collect_column_target,
  ),

  // [UNIQUE] INDEX index_specification
  //
  // index_specification:
  //   { index_name
  //   | [index_name] [ALL] (col[,...]) [ORDER BY {VALUES|HASH} (col)]
  //   }
  _collect_index_target: $ => prec.right(seq(
    optional($.keyword_unique),
    $.keyword_index,
    choice(
      // Form A: with column list
      seq(
        optional(field('index_name', $.identifier)),
        optional($.keyword_all),
        wrapped_in_parenthesis(comma_list(field('column', $.identifier), true)),
        optional($.collect_index_order_by),
      ),
      // Form B: just an index_name (no column list)
      field('index_name', $.identifier),
    ),
  )),

  collect_index_order_by: $ => seq(
    $.keyword_order,
    $.keyword_by,
    choice($.keyword_values, $.keyword_hash),
    wrapped_in_parenthesis(field('order_column', $.identifier)),
  ),

  // COLUMN column_specification
  //
  // column_specification:
  //   { { expression | column_name
  //     | ( {expression | column_name | PARTITION}[,...] )
  //     } [[AS] statistics_name]
  //   | PARTITION
  //   | statistics_name
  //   }
  _collect_column_target: $ => prec.right(seq(
    $.keyword_column,
    $._collect_column_specification,
  )),

  _collect_column_specification: $ => choice(
    // ( column_name|PARTITION [,...] ) [[AS] stats_name]
    // Note: full expressions are formally allowed by Teradata here; we
    // accept simple column references (object_reference), which covers
    // the vast majority of real-world usage and matches the existing
    // tree shape used elsewhere in this grammar.
    seq(
      wrapped_in_parenthesis(
        comma_list(
          choice(
            $.keyword_partition,
            field('value', $.object_reference),
          ),
          true,
        ),
      ),
      optional(seq(
        optional($.keyword_as),
        field('statistics_name', $.identifier),
      )),
    ),
    // PARTITION
    $.keyword_partition,
    // single column_name [[AS] stats_name]  (also covers bare stats_name)
    prec.right(seq(
      field('value', $.object_reference),
      optional(seq(
        optional($.keyword_as),
        field('statistics_name', $.identifier),
      )),
    )),
  ),

  // ------------------------------------------------------------------
  // ON collection_source
  //
  // collection_source:
  //   { [TEMPORARY] [db.]table_name
  //   | [db.]{join_index_name | hash_index_name}
  //   }
  // (Join/hash indexes look like a plain object_reference at parse time.)
  // ------------------------------------------------------------------
  _collection_source: $ => seq(
    optional($.keyword_temporary),
    $.object_reference,
  ),

  // ------------------------------------------------------------------
  // FROM from_option
  //
  // from_option:
  //   { [TEMPORARY] [db.]table_name
  //   | [db.]{join_index_name | hash_index_name}
  //   }
  //   [ COLUMN { col | PARTITION | stats_name | (col|PARTITION,...) } ]
  // ------------------------------------------------------------------
  collect_from_clause: $ => seq(
    $.keyword_from,
    optional($.keyword_temporary),
    field('from_source', $.object_reference),
    optional(seq(
      $.keyword_column,
      choice(
        $.keyword_partition,
        wrapped_in_parenthesis(
          comma_list(
            choice($.keyword_partition, field('column', $.identifier)),
            true,
          ),
        ),
        field('column', $.identifier),
      ),
    )),
  ),

};
