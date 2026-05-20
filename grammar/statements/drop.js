const {
  comma_list,
  wrapped_in_parenthesis,
} = require('../helpers.js');

module.exports = {

    _drop_behavior: $ => choice(
      $.keyword_cascade,
      $.keyword_restrict,
    ),

    _drop_statement: $ => seq(
      choice(
        $.drop_table,
        $.drop_view,
        $.drop_index,
        $.drop_type,
        $.drop_database,
        $.drop_role,
        $.drop_sequence,
        $.drop_function,
        $.drop_macro,
        $.drop_stats,
        $.drop_join_index,
        $.drop_hash_index,
        $.drop_procedure,
      ),
    ),

    drop_join_index: $ => seq(
      $.keyword_drop,
      $.keyword_join,
      $.keyword_index,
      $.object_reference,
    ),

    drop_hash_index: $ => seq(
      $.keyword_drop,
      $.keyword_hash,
      $.keyword_index,
      $.object_reference,
    ),

  drop_stats: $ => seq(
    $.keyword_drop,
    choice($._stats, $.keyword_stat),
    optional(
      comma_list(
        choice(
          seq(
            optional($.keyword_unique),
            $.keyword_index,
            optional(field('index_name', $.identifier)),
            optional($.keyword_all),
            wrapped_in_parenthesis(comma_list(field('column', $.identifier), true)),
            optional(
              seq(
                $.keyword_order,
                $.keyword_by,
                optional(choice($.keyword_values, $.keyword_hash)),
                wrapped_in_parenthesis(field('order_column', $.identifier)),
              )
            ),
          ),
          seq(
            $.keyword_column,
            choice(
              field('column', $.identifier),
              wrapped_in_parenthesis(comma_list(field('column', $.identifier), true)),
            ),
          ),
        ),
        false,
      )
    ),
    $.keyword_on,
    optional($.keyword_temporary),
    field('table', $.object_reference),
    optional(
      choice(
        seq(
          field('column', $.identifier),
          optional(
            seq(
              optional($.keyword_as),
              field('statistics_name', $.identifier),
            )
          ),
        ),
        $.keyword_partition,
      ),
    ),
  ),

    drop_table: $ => seq(
      $.keyword_drop,
      $.keyword_table,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_view: $ => seq(
      $.keyword_drop,
      $.keyword_view,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_database: $ => seq(
      $.keyword_drop,
      $.keyword_database,
      $.identifier,
      optional($.keyword_with),
    ),

    drop_role: $ => seq(
      $.keyword_drop,
      choice(
        $.keyword_group,
        $.keyword_role,
        $.keyword_user,
      ),
      $.identifier,
    ),

    drop_type: $ => seq(
      $.keyword_drop,
      $.keyword_type,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_sequence: $ => seq(
      $.keyword_drop,
      $.keyword_sequence,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_index: $ => seq(
      $.keyword_drop,
      $.keyword_index,
      field("name", $.identifier),
      optional($._drop_behavior),
      optional(
        seq(
            $.keyword_on,
            $.object_reference,
        ),
      ),
    ),

    drop_function: $ => seq(
      $.keyword_drop,
      $.keyword_function,
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_macro: $ => seq(
      $.keyword_drop,
      $.keyword_macro,
      $.object_reference,
    ),

    drop_procedure: $ => seq(
      $.keyword_drop,
      $.keyword_procedure,
      $.object_reference,
    ),

};
