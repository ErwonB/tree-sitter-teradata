const {
  make_keyword,
  optional_parenthesis,
  wrapped_in_parenthesis,
  parametric_type,
  comma_list,
  paren_list,
} = require('./grammar/helpers.js');
const keyword_rules = require('./grammar/keywords.js');
const type_rules = require('./grammar/types.js');
const expression_rules = require('./grammar/expressions.js');
const transaction_rules = require('./grammar/transactions.js');
const bteq_rules = require('./grammar/bteq.js');
const statement_rules = require('./grammar/statements/index.js');

module.exports = grammar({
  name: 'teradata',

  extras: $ => [
    /\s\n/,
    /\s/,
    $.comment,
    $.marginalia,
  ],


  externals: $ => [
  ],

  conflicts: $ => [
    [$.object_reference, $._qualified_field],
    [$.object_reference],
    [$.between_expression, $.period_expression, $.binary_expression],
    [$._expression_base, $.binary_expression],
    [$.copy_options],
    [$._integer], [$._decimal_number],
    [$.new_expression],
    [$.bit],
    [$.binary],
    [$.varbinary],
    [$.float],
    [$.double],
    [$.decimal],
    [$.numeric],
    [$.json],
    [$.char],
    [$.varchar],
    [$.nchar],
    [$.nvarchar],
    [$.time],
    [$.timestamp]
  ],

  precedences: $ => [
    [
      'binary_is',
      'unary_not',
      'binary_exp',
      'binary_mod',
      'binary_times',
      'binary_plus',
      'unary_other',
      'binary_other',
      'binary_in',
      'binary_compare',
      'binary_relation',
      'pattern_matching',
      'between',
      'clause_connective',
      'clause_disjunctive',
    ],
  ],

  word: $ => $._identifier,

  rules: {
    program: $ => seq(
      // any number of transactions, statements, or blocks with a terminating ;
      repeat(
        seq(
          choice(
            seq(choice(
              $.transaction,
              $.statement,
              $.block,
            ),
            ';',
            ),
            seq($.bteq_statement, optional(';')),
          ),
        ),
      ),
      // optionally, a single statement without a terminating ;
      optional(
          $.statement,
      ),
    ),

    ...keyword_rules,


    ...type_rules,

    comment: _ => /--.*/,
    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment
    marginalia: _ => /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//,

    ...transaction_rules,

    ...statement_rules,

    ...expression_rules,

    ...bteq_rules,


  }

});
