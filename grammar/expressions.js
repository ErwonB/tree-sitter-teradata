const {
  comma_list,
  optional_parenthesis,
  paren_list,
  wrapped_in_parenthesis,
} = require('./helpers.js');

module.exports = {

    all_fields: $ => seq(
      optional(
        seq(
          $.object_reference,
          '.',
        ),
      ),
      '*',
    ),


    parameter: $ => /\?|(\$[0-9]+)/,

    case: $ => seq(
      $.keyword_case,
      choice(
        // simplified CASE x WHEN
        seq(
          $._expression,
          $.keyword_when,
          $._expression,
          $.keyword_then,
          $._expression,
          repeat(
            seq(
              $.keyword_when,
              $._expression,
              $.keyword_then,
              $._expression,
            )
          ),
        ),
        // standard CASE WHEN x, where x must be a predicate
        seq(
          $.keyword_when,
          $._expression,
          $.keyword_then,
          $._expression,
          repeat(
            seq(
              $.keyword_when,
              $._expression,
              $.keyword_then,
              $._expression,
            )
          ),
        ),
      ),
      optional(
        seq(
          $.keyword_else,
          $._expression,
        )
      ),
      $.keyword_end,
    ),

    field: $ => field('name', $.identifier),

    _qualified_field: $ => seq(
      optional(
        seq(
          optional_parenthesis($.object_reference),
          '.',
        ),
      ),
      field('name', $.identifier),
    ),

    implicit_cast: $ => prec.dynamic(1, seq(
      $._expression,
      wrapped_in_parenthesis($._castable_type)
    )),

    // Postgres syntax for intervals
    interval: $ => seq(
        $.keyword_interval,
        $._literal_string,
        $._temporal_qualifier,
    ),

    cast: $ => seq(
      field('name', choice($.keyword_cast,$.keyword_trycast)),
      wrapped_in_parenthesis(
        seq(
          field('parameter', $._expression),
          $.keyword_as,
          $._type,
          //TODO CHARACTER SET
          optional(seq($.keyword_format, $._literal_string)),
        ),
      ),
    ),

    format: $ => seq($.keyword_format, $._literal_string),

    filter_expression : $ => seq(
      $.keyword_filter,
      wrapped_in_parenthesis($.where),
    ),

    _one_word_function: $ => prec(0, choice(
      $.keyword_user,
      $.keyword_session,
      $.keyword_role,
      $.keyword_current_date,
      $.keyword_current_time,
      $.keyword_current_user,
     ),
    ),

    _one_word_function_with_parens: $ => choice(
      prec(1, seq($.keyword_current_timestamp, '(', $._integer, ')')),
      prec(0, $.keyword_current_timestamp),
    ),


    invocation: $ => prec(1,
      choice(
       choice($._one_word_function, $._one_word_function_with_parens),
          seq(
            $.object_reference,
            choice(
              // default invocation
              paren_list(
                seq(
                  optional($.keyword_distinct),
                  field(
                    'parameter',
                    $.term,
                  ),
                  optional($.order_by)
                )
              ),
              //translate
              paren_list(
                seq(
                  field(
                    'expression',
                    $._expression,
                  ),
                  $.keyword_using,
                  field('encoding',$.encoding_identifier),
                  optional(seq($.keyword_with, $.keyword_error)),
                )
              ),
              //trim
              //extract
              paren_list(
                seq(
                  choice(
                    field('unit', $.object_reference,),
                    seq(choice($.keyword_leading, $.keyword_trailing, $.keyword_both),
                        optional($.literal),
                      ),
                  ),
                  $.keyword_from,
                  $.term
                )
              ),
              //position
              paren_list(
                seq(
                  field('expression',$._expression),
                  $.keyword_in,
                  field('expression',$._expression),
                )
              ),
              // _aggregate_function, e.g. group_concat
              wrapped_in_parenthesis(
                seq(
                  optional($.keyword_distinct),
                  field('parameter', $.term),
                  optional($.order_by),
                  optional(seq(
                    choice($.keyword_separator, ','),
                    alias($._literal_string, $.literal)
                  )),
                ),
              ),
            ),
            optional(
              $.filter_expression
            )
          ),
      ),
    ),

    exists: $ => seq(
      $.keyword_exists,
      $.subquery,
    ),

    partition_by: $ => seq(
        $.keyword_partition,
        $.keyword_by,
        comma_list($._expression, true),
    ),

    frame_definition: $ => seq(
        choice(
          seq(
            $.keyword_unbounded,
            $.keyword_preceding,
          ),
          seq(
              field("start",
                choice(
                  $.identifier,
                  $.binary_expression,
                  alias($._literal_string, $.literal),
                  alias($._integer, $.literal)
                )
              ),
              $.keyword_preceding,
          ),
          $._current_row,
          seq(
              field("end",
                choice(
                  $.identifier,
                  $.binary_expression,
                  alias($._literal_string, $.literal),
                  alias($._integer, $.literal)
                )
              ),
              $.keyword_following,
          ),
          seq(
            $.keyword_unbounded,
            $.keyword_following,
          ),
        ),
    ),

    window_frame: $ => seq(
        choice(
            $.keyword_range,
            $.keyword_rows,
            $.keyword_groups,
        ),

        choice(
            seq(
                $.keyword_between,
                $.frame_definition,
                optional(
                  seq(
                    $.keyword_and,
                    $.frame_definition,
                  )
                )
            ),
            seq(
                $.frame_definition,
            )
        ),
        optional(
            choice(
                $._exclude_current_row,
                $._exclude_group,
                $._exclude_ties,
                $._exclude_no_others,
            ),
        ),
    ),

    window_clause: $ => seq(
        $.keyword_window,
        $.identifier,
        $.keyword_as,
        $.window_specification,
    ),

    window_specification: $ => wrapped_in_parenthesis(
      seq(
        optional($.partition_by),
        optional($.order_by),
        optional($.window_frame),
      ),
    ),

    window_function: $ => seq(
        $.invocation,
        $.keyword_over,
        choice(
            $.identifier,
            $.window_specification,
        ),
    ),

    _alias: $ => seq(
      optional($.keyword_as),
      field('alias', $.identifier),
    ),

    _expression_base: $ => prec(2, choice(
          $.literal,
          alias(
            $._qualified_field,
            $.field,
          ),
          $.parameter,
          $.list,
          $.case,
          $.window_function,
          $.subquery,
          $.cast,
          alias($.implicit_cast, $.cast),
          $.exists,
          $.invocation,
          $.binary_expression,
          $.subscript,
          $.unary_expression,
          $.interval,
          $.between_expression,
          $.parenthesized_expression,
          $.interval_expression,
          $.attribute_expression,
          $.period_expression,
        ),
      ),

    _expression: $ => choice(
      prec(3, seq($._expression_base, $._temporal_qualifier)),
      prec(2, seq($._expression_base, $.keyword_escape, $._literal_string)),
      prec(1, $._expression_base),
    ),

    period_expression: $ => prec.left(seq(
      field('left', $._expression),
      field('period_operator', $.period_operator),
      field('right', $._expression),
    )),

  period_operator: $ => seq(
    optional($.keyword_not),
    choice($.keyword_contains,
      $.keyword_overlaps,
      $.keyword_equals,
      $.keyword_meets,
      $.keyword_ldiff,
      $.keyword_rdiff,
      $.keyword_p_intersect,
      seq(optional($.keyword_immediately), choice($.keyword_precedes, $.keyword_succeeds)),
    ),
  ),

    parenthesized_attribute: $ => wrapped_in_parenthesis(seq(
      choice($.keyword_title, $.keyword_format),
      $._expression,
    )),

    attribute_expression: $ => prec.left(2, seq(
      field('expression', $._expression),
      field('attribute', $.parenthesized_attribute)
    )),


    table_function: $ => seq($.keyword_table,
      wrapped_in_parenthesis($._table_expression),
    ),

    _table_expression: $ => prec(1,
      choice(
        $.split_to_table_expression,
      )
    ),

    split_to_table_expression: $ => seq(
      choice($.keyword_strtok_split_to_table, $.keyword_regexp_split_to_table),
      "(",
        seq(
          field('inkey', choice($.object_reference, $.literal)), ',',
          field('instring', choice($.object_reference, $.literal)), ',',
          field('delimiter', $._literal_string),
          optional(seq(',', field('match_arg', $._literal_string))),
          ),
        ")",
      $.keyword_returns,
      "(",
        seq(
          field('outkey', seq($._column, $._type)), ',',
          field('tokennum', seq($._column, $._type)), ',',
          field('token', seq($._column, $._type)),
          ),
        ")",
    ),

    interval_expression: $ => seq($.keyword_interval,
    "(",
        field('period_expression', $._expression),
        ")",
        field('temporal_qualifier', $._temporal_qualifier),
    ),

    //TODO refactor
    _temporal_qualifier: $ => choice(
      $.keyword_year,
      prec.right(1, seq($.keyword_year, optional(wrapped_in_parenthesis($._integer)), $.keyword_to, $.keyword_month)),

      $.keyword_month,

      seq($.keyword_day, optional(wrapped_in_parenthesis($._integer))),
      prec.right(1, seq($.keyword_day, optional(wrapped_in_parenthesis($._integer)), $.keyword_to, choice($.keyword_hour, $.keyword_minute, seq($.keyword_second, optional(wrapped_in_parenthesis($._integer)))))),

      seq($.keyword_hour, optional(wrapped_in_parenthesis($._integer))),
      prec.right(1, seq($.keyword_hour, optional(wrapped_in_parenthesis($._integer)), $.keyword_to, choice($.keyword_minute, seq($.keyword_second, optional(wrapped_in_parenthesis($._integer)))))),

      seq($.keyword_minute, optional(wrapped_in_parenthesis($._integer))),
      prec.right(1, seq($.keyword_minute, optional(wrapped_in_parenthesis($._integer)), $.keyword_to, seq($.keyword_second, optional(wrapped_in_parenthesis($._integer))))),

      prec.right(1, seq($.keyword_second, optional(wrapped_in_parenthesis(seq($._integer, optional(seq(',', $._integer))))))),
    ),

    parenthesized_expression: $ => prec(2,
      wrapped_in_parenthesis($._expression)
    ),

    subscript: $ => prec.left('binary_is',
      seq(
        field('expression', $._expression),
        "[",
        choice(
          field('subscript', $._expression),
          seq(
            field('lower', $._expression),
            ':',
            field('upper', $._expression),
          ),
        ),
        "]",
      ),
    ),

    op_other: $ => token(
      choice(
        '->',
        '->>',
        '#>',
        '#>>',
        '~',
        '!~',
        '~*',
        '!~*',
        '|',
        '&',
        '#',
        '<<',
        '>>',
        '<<=',
        '>>=',
        '##',
        '<->',
        '@>',
        '<@',
        '&<',
        '&>',
        '|>>',
        '<<|',
        '&<|',
        '|&>',
        '<^',
        '^>',
        '?#',
        '?-',
        '?|',
        '?-|',
        '?||',
        '@@',
        '@@@',
        '@?',
        '#-',
        '?&',
        '?',
        '-|-',
        '||',
        '^@',
      ),
    ),

    binary_expression: $ => choice(
      ...[
        ['+', 'binary_plus'],
        ['-', 'binary_plus'],
        ['*', 'binary_times'],
        ['/', 'binary_times'],
        ['%', 'binary_times'],
        ['^', 'binary_exp'],
        ['**', 'binary_exp'],
        ['=', 'binary_relation'],
        ['<', 'binary_relation'],
        ['<=', 'binary_relation'],
        ['!=', 'binary_relation'],
        ['>=', 'binary_relation'],
        ['>', 'binary_relation'],
        ['<>', 'binary_relation'],
        [$.keyword_mod, 'binary_mod'],
        [$.op_other, 'binary_other'],
        [$.keyword_is, 'binary_is'],
        [$.is_not, 'binary_is'],
        [$.keyword_like, 'pattern_matching'],
        [$.not_like, 'pattern_matching'],
        [$.similar_to, 'pattern_matching'],
        [$.not_similar_to, 'pattern_matching'],
        // binary_is precedence disambiguates `(is not distinct from)` from an
        // `is (not distinct from)` with a unary `not`
        [$.distinct_from, 'binary_is'],
        [$.not_distinct_from, 'binary_is'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression)
        ))
      ),
      ...[
        [$.keyword_and, 'clause_connective'],
        [$.keyword_or, 'clause_disjunctive'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression)
        ))
      ),
      ...[
        [$.keyword_in, 'binary_in'],
        [$.not_in, 'binary_in'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', choice($.list, $.subquery, ))
        ))
      ),
    ),

    op_unary_other: $ => token(
      choice(
        '|/',
        '||/',
        '@',
        '~',
        '@-@',
        '@@',
        '#',
        '?-',
        '?|',
        '!!',
      ),
    ),

    unary_expression: $ => choice(
      ...[
        [$.keyword_not, 'unary_not'],
        [$.bang, 'unary_not'],
        [$.keyword_any, 'unary_not'],
        [$.keyword_some, 'unary_not'],
        [$.keyword_all, 'unary_not'],
        [$.op_unary_other, 'unary_other'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('operator', operator),
          field('operand', $._expression)
        ))
      ),
    ),

    between_expression: $ => choice(
      ...[
            [$.keyword_between, 'between'],
            [seq($.keyword_not, $.keyword_between), 'between'],
        ].map(([operator, precedence]) =>
                prec.left(precedence, seq(
                field('left', $._expression),
                field('operator', operator),
                field('low', $._expression),
                $.keyword_and,
                field('high', $._expression),
                optional($.each_clause),
            ))
        ),
    ),

    each_clause: $ => seq(
      $.keyword_each,
      choice(
        $.interval,
        $.literal
      )
    ),


    not_in: $ => seq(
      $.keyword_not,
      $.keyword_in,
    ),

    subquery: $ => wrapped_in_parenthesis(
      $._dml_read
    ),

    list: $ => paren_list($._expression),

    literal: $ => prec(2,
      choice(
        $._integer,
        $._decimal_number,
        $._literal_string,
        $._bit_string,
        $._string_casting,
        $.keyword_true,
        $.keyword_false,
        $.keyword_null,
        $._interpolated_var
      ),
    ),
    _double_quote_string: _ => /"[^"]*"/,
    // The norm specify that between two consecutive string must be a return,
    // but this is good enough.
    _single_quote_string: _ => seq(/([uU]&|[nN])?'([^']|'')*'/, repeat(/'([^']|'')*'/)),

    _postgres_escape_string: _ => /(e|E)'([^']|\\')*'/,

    _literal_string: $ => prec(
      1,
      choice(
        $._single_quote_string,
        $._double_quote_string,
        $._postgres_escape_string,
      ),
    ),
    _natural_number: _ => /\d+/,
    _integer: $ => seq(
      optional(choice("-", "+")),
      /(0[xX][0-9A-Fa-f]+(_[0-9A-Fa-f]+)*)|(0[oO][0-7]+(_[0-7]+)*)|(0[bB][01]+(_[01]+)*)|(\d+(_\d+)*(e[+-]?\d+(_\d+)*)?)/
    ),
    _decimal_number: $ => seq(
      optional(
        choice("-", "+")),
      /((\d+(_\d+)*)?[.]\d+(_\d+)*(e[+-]?\d+(_\d+)*)?)|(\d+(_\d+)*[.](e[+-]?\d+(_\d+)*)?)/
    ),
    _bit_string: $ => seq(/[bBxX]'([^']|'')*'/, repeat(/'([^']|'')*'/)),
    // The identifier should be followed by a string (no parenthesis allowed)
    _string_casting: $ => seq($.identifier, $._single_quote_string),

    bang: _ => '!',

    _interpolated_var: $ => choice(
      $._interpolated_identifier,
      $._interpolated_identifier1,
      $._interpolated_identifier2,
    ),

    identifier: $ => choice(
      $._identifier,
      $._double_quote_string,
      $._tsql_parameter,
      $._macro_identifier,
    ),
    _tsql_parameter: $ => seq('@', $._identifier),
    _identifier: _ => /[a-zA-Z_][0-9a-zA-Z_]*/,
    _macro_identifier: _ => /\:[a-zA-Z_][0-9a-zA-Z_]*/,
  //TODO reword identifier regex
    _interpolated_identifier2: _ => /[0-9a-zA-Z_]*\$\{[0-9a-zA-Z_]*\}[0-9a-zA-Z_]*/,
    _interpolated_identifier1: _ => /\$\{[a-zA-Z_][0-9a-zA-Z_]*\}/,
    _interpolated_identifier: _ => /\$\{[a-zA-Z_][0-9a-zA-Z_]*\}_[a-zA-Z_][0-9a-zA-Z_]*/,
    encoding_identifier: _ => /[a-zA-Z_][0-9a-zA-Z_]*_TO_[a-zA-Z_][0-9a-zA-Z_]*/,

    object_reference: $ => choice(
      seq(
        field('database', $.identifier),
        '.',
        field('schema', $.identifier),
        '.',
        field('name', $.identifier),
      ),
      seq(
        field('schema', choice($.identifier, alias($._interpolated_var, $.identifier))),
        '.',
        field('name', choice($.identifier, alias($._interpolated_var, $.identifier))),
      ),
      field('name', choice($.identifier, alias($._interpolated_var, $.identifier))),
    ),

};
