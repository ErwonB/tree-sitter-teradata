const { comma_list, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

  _collect_statement: $ => seq(
      $.keyword_collect,
      $._stats,
      choice(
        // Form: COLLECT STATS ON table COLUMN col
        seq(
          $.keyword_on, $.object_reference,
          $.keyword_column, field('value', $.object_reference)
        ),
        // Form: COLLECT STATS ON table COLUMN (col, col, ...)
        seq(
          $.keyword_on, $.object_reference,
          $.keyword_column, wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
        ),
        // Form: COLLECT STATS COLUMN (col,...) [, COLUMN (col,...)] ON table
        seq(
          $.keyword_column,
          choice(
            field('value', $.object_reference),
            wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
          ),
          repeat(seq(
            ',',
            $.keyword_column,
            choice(
              field('value', $.object_reference),
              wrapped_in_parenthesis(comma_list(field('value', $.object_reference)))
            ),
          )),
          $.keyword_on,
          $.object_reference,
        ),
      )
    ),

};
