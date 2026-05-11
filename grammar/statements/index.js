const { optional_parenthesis } = require('../helpers.js');

const select_rules    = require('./select.js');
const delete_rules    = require('./delete.js');
const insert_rules    = require('./insert.js');
const update_rules    = require('./update.js');
const merge_rules     = require('./merge.js');
const copy_rules      = require('./copy.js');
const unload_rules    = require('./unload.js');
const show_rules      = require('./show.js');
const collect_rules   = require('./collect.js');
const comment_rules   = require('./comment.js');
const misc_rules      = require('./misc.js');
const create_rules    = require('./create.js');
// Note: create-procedure.js, create-function.js, create-macro.js are
// kept as reference modules but their rules are already included in create.js
const alter_rules     = require('./alter.js');
const drop_rules      = require('./drop.js');
const rename_rules    = require('./rename.js');

module.exports = {

  statement: $ => choice(
    seq(
      optional(seq(
        $.keyword_explain,
      )),
      choice(
        $._ddl_statement,
        seq(optional($.lock_clause), $._dml_write),
        optional_parenthesis($._dml_read),
      ),
    ),
    $._show_statement,
    $._collect_statement,
  ),

  _ddl_statement: $ => choice(
    $._create_statement,
    $._modify_statement,
    $._alter_statement,
    $._drop_statement,
    $._rename_statement,
    $._merge_statement,
    $._database_statement,
    $.comment_statement,
    $.set_statement,
    $.reset_statement,
  ),

  _cte: $ => seq(
      $.keyword_with,
      optional($.keyword_recursive),
      $.cte,
      repeat(
          seq(
            ',',
            $.cte,
          ),
      ),
  ),

  _dml_write: $ => seq(
    seq(
      optional(
        $._cte,
      ),
      choice(
        $._delete_statement,
        $._insert_statement,
        seq($._update_statement, optional($._else_insert_statement)),
        $._copy_statement,
        $._macro_statement,
        $._procedure_statement,
        $._abort_statement,
      ),
    ),
  ),

  _else_insert_statement: $ => seq($.keyword_else, $._insert_statement),

  _dml_read: $ => seq(
    optional($.lock_clause),
    optional(optional_parenthesis($._cte)),
    optional_parenthesis(
      choice(
        $._select_statement,
        $.set_operation,
        $._unload_statement,
      ),
    ),
  ),

  _macro_statement: $ => seq(
    $.macro,
  ),

  _procedure_statement: $ => seq(
    $.procedure,
  ),

  _abort_statement: $ => seq(
    $.abort,
  ),

  _database_statement: $ => seq(
    $.keyword_database,
    $.object_reference,
  ),

  ...select_rules,
  ...delete_rules,
  ...insert_rules,
  ...update_rules,
  ...merge_rules,
  ...copy_rules,
  ...unload_rules,
  ...show_rules,
  ...collect_rules,
  ...comment_rules,
  ...misc_rules,
  ...create_rules,
  ...alter_rules,
  ...drop_rules,
  ...rename_rules,

};
