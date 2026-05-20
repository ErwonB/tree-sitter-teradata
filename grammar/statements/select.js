const { comma_list, optional_parenthesis, paren_list, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

    cte: $ => seq(
      $.identifier,
      optional(paren_list(field("argument", $.identifier))),
      $.keyword_as,
      wrapped_in_parenthesis(
        alias(
          choice($._dml_read, $._dml_write),
          $.statement,
        ),
      ),
    ),

    set_operation: $ => seq(
      $._select_statement,
      repeat1(
        seq(
          field(
            "operation",
            choice(
              seq($.keyword_union, optional($.keyword_all)),
              $.keyword_except,
              $.keyword_intersect,
            ),
          ),
          $._select_statement,
        ),
      ),
    ),

    //TODO refactor optional($.where) properly
    _select_statement: $ => choice(
      optional_parenthesis(
        seq(
          optional($.temporal_modifier),
          $.select,
          optional(
            seq(
              $.keyword_into,
              $.select_expression,
            ),
          ),
          optional($.where),
        ),
      ),
      optional_parenthesis(
        seq(
          optional($.temporal_modifier),
          $.select,
          optional(
            seq(
              $.keyword_into,
              $.select_expression,
            ),
          ),
          $.from,
        ),
      ),
    ),

    select: $ => seq(
      $._select,
      choice(
        seq($.keyword_distinct, $.select_expression),
        seq($.top_clause, $.select_expression),
        $.select_expression
      ),
    ),

    temporal_modifier: $ => choice(seq(
          choice($.keyword_current, $.keyword_nonsequenced),
          choice($.keyword_transactiontime, $.keyword_validtime)
        ),
        seq(
          choice($.keyword_transactiontime, $.keyword_validtime),
          seq($.keyword_as, $.keyword_of, optional($.keyword_timestamp), $.literal)
        ),
        ),

    _lock_type: $ => choice(
      $.keyword_access,
      $.keyword_exclusive,
      $.keyword_excl,
      seq($.keyword_read, optional($.keyword_override)),
      $.keyword_share,
      $.keyword_write,
      $.keyword_checksum,
      seq($.keyword_load, $.keyword_committed),
    ),

    lock_clause: $ => choice(
      seq($._lock, $.keyword_row, choice($.keyword_for, $.keyword_in), $._lock_type, optional($.keyword_mode), optional($.keyword_nowait)),
        repeat1(
          seq($._lock, optional(choice($.keyword_table, $.keyword_view, $.keyword_database)), $.object_reference, choice($.keyword_for, $.keyword_in),
            $._lock_type, optional($.keyword_mode), optional($.keyword_nowait)),
          ),
      ),

    top_clause: $ => seq(
      $.keyword_top,
      field('top_value', alias($._integer, $.literal)),
      optional($.keyword_percent),
      optional(seq($.keyword_with, $.keyword_ties))
    ),

    sample_value: $ => comma_list(
                    choice(
                      $._integer,
                      $._decimal_number,
                      )
                      ,true
                    ),

    sample_clause: $ => seq(
    $.keyword_sample,
    optional(seq($.keyword_with, $.keyword_replacement)),
    optional(seq($.keyword_randomized, $.keyword_allocation)),
    choice( $.sample_value,
      seq(
          $.keyword_when,
          $._expression,
          $.keyword_then,
          $.sample_value,
          repeat(
            seq(
              $.keyword_when,
              $._expression,
              $.keyword_then,
              $.sample_value,
            )
          ),
        optional(
          seq(
            $.keyword_else,
            $.sample_value,
          )
        ),
        $.keyword_end,
      )
    )
  ),


    select_expression: $ => seq(
      $.term,
      repeat(
        seq(
          ',',
          $.term,
        ),
      ),
    ),

    term: $ => seq(
      field(
        'value',
        choice(
          $.all_fields,
          $._expression,
        ),
      ),
      optional($._alias),
    ),

    from: $ => seq(
      $.keyword_from,
      comma_list($.relation, true),
      optional($.index_hint),
      repeat(
        choice(
          $.join,
          $.cross_join,
        ),
      ),
      optional($.pivot),
      optional($.where),
      optional($.group_by),
      optional($.having),
      optional($.window_clause),
      optional($.qualify),
      optional($.sample_clause),
      optional($.order_by),
    ),

    relation: $ => prec.right(
      seq(
        choice(
          $.subquery,
          $.table_function,
          $.invocation,
          $.object_reference,
          wrapped_in_parenthesis($.values),
        ),
        optional(
          seq(
            $._alias,
            optional(alias($._column_list, $.list)),
          ),
        ),
      ),
    ),

    values: $ => seq(
      $.keyword_values,
      $.list,
      optional(
          repeat(
          seq(
            ',',
            $.list,
          ),
        ),
      ),
    ),

    index_hint: $ => seq(
      choice(
        $.keyword_use,
        $.keyword_ignore,
      ),
      $.keyword_index,
      optional(
        seq(
          $.keyword_for,
          $.keyword_join,
        ),
      ),
      wrapped_in_parenthesis(
        field('index_name', $.identifier),
      ),
    ),

    join: $ => seq(
      optional(
        choice(
          $.keyword_left,
          seq($.keyword_full, $.keyword_outer),
          seq($.keyword_left, $.keyword_outer),
          $.keyword_right,
          seq($.keyword_right, $.keyword_outer),
          $.keyword_inner,
          $.keyword_full,
        ),
      ),
      $.keyword_join,
      $.relation,
      optional($.index_hint),
      optional($.join),
      choice(
        seq(
          $.keyword_on,
          field("predicate", $._expression),
        ),
        seq(
          $.keyword_using,
          alias($._column_list, $.list),
        )
      )
    ),

    cross_join: $ => prec.right(
      seq(
        $.keyword_cross,
        $.keyword_join,
        $.relation,
      )
    ),

    where: $ => seq(
      $.keyword_where,
      field("predicate", $._expression),
    ),


    pivot: $ => seq(
      $.keyword_pivot,
      wrapped_in_parenthesis($.pivot_body),
      optional($._alias)
    ),

    pivot_body: $ => seq(
      $.agg_list,
      $.keyword_for,
      $.for_columns,
      $.keyword_in,
      $.pivot_in,
      optional($.with_pivot)
    ),

    agg_function: $ => choice($.keyword_sum, $.keyword_avg, $.keyword_min, $.keyword_max),

    agg_call: $ => seq(
      $.agg_function,
      wrapped_in_parenthesis($.object_reference),
      optional($._alias)
    ),

    agg_list: $ => comma_list($.agg_call, true),

    for_columns: $ => choice(
      $.object_reference,
      wrapped_in_parenthesis(comma_list($.object_reference))
    ),

    pivot_in: $ => choice(
      wrapped_in_parenthesis($.pivot_in_values),
      wrapped_in_parenthesis($.pivot_in_tuples),
      $.subquery
    ),

    value_or_ref: $ => choice($.object_reference, $.literal),

    pivot_in_values: $ => comma_list(seq($.value_or_ref, optional($._alias)), true),

    tuple_value: $ => wrapped_in_parenthesis(comma_list($.value_or_ref), true),
    pivot_in_tuples: $ => comma_list($.tuple_value, true),

    with_pivot: $ => seq(
      $.keyword_with,
      $.agg_function,
      wrapped_in_parenthesis(comma_list($.value_or_ref)),
      optional($._alias)
    ),

    group_by: $ => seq(
      $.keyword_group,
      $.keyword_by,
      comma_list($._expression, true),
    ),

    having: $ => seq(
      $.keyword_having,
      $._expression,
    ),

    qualify: $ => seq(
      $.keyword_qualify,
      $._expression,
    ),

    order_by: $ => prec.right(seq(
      $.keyword_order,
      $.keyword_by,
      comma_list($.order_target, true),
    )),

    order_target: $ => seq(
      $._expression,
      optional(
        seq(
          choice(
            $.direction,
            seq(
              $.keyword_using,
              choice('<', '>', '<=', '>='),
            ),
          ),
          optional(
            seq(
              $.keyword_nulls,
              choice(
                $.keyword_first,
                $.keyword_last,
              ),
            ),
          ),
        ),
      ),
    ),

};
