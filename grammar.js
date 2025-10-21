module.exports = grammar({
  name: 'sql',

  extras: $ => [
    /\s\n/,
    /\s/,
    $.comment,
    $.marginalia,
  ],


  externals: $ => [
    $._dollar_quoted_string_start_tag,
    $._dollar_quoted_string_end_tag,
    $._dollar_quoted_string,
  ],

  conflicts: $ => [
    [$.object_reference, $._qualified_field],
    [$.object_reference],
    [$.between_expression, $.period_expression, $.binary_expression],
  ],

  precedences: $ => [
    [
      'binary_is',
      'unary_not',
      'binary_exp',
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

    keyword_strtok_split_to_table: _ => make_keyword("strtok_split_to_table"),
    keyword_pivot: _ => make_keyword("pivot"),
    keyword_casespecific: _ => make_keyword("casespecific"),
    keyword_regexp_split_to_table: _ => make_keyword("regexp_split_to_table"),
    keyword_collect: _ => make_keyword("collect"),
    keyword_compress: _ => make_keyword("compress"),
    keyword_top: _ => make_keyword("top"),
    keyword_qualify: _ => make_keyword("qualify"),
    keyword_macro: _ => make_keyword("macro"),
    keyword_lock: _ => make_keyword("lock"),
    keyword_locking: _ => make_keyword("locking"),
    keyword_access: _ => make_keyword("access"),
    keyword_nonsequenced: _ => make_keyword("nonsequenced"),
    keyword_transactiontime: _ => make_keyword("transactiontime"),
    keyword_validtime: _ => make_keyword("validtime"),
    keyword_nontemporal: _ => make_keyword("nontemporal"),
    keyword_extract: _ => make_keyword("extract"),
    keyword_translate: _ => make_keyword("translate"),
    keyword_leading: _ => make_keyword("leading"),
    keyword_trailing: _ => make_keyword("trailing"),
    keyword_both: _ => make_keyword("both"),
    keyword_year: _ => make_keyword("year"),
    keyword_month: _ => make_keyword("month"),
    keyword_day: _ => make_keyword("day"),
    keyword_hour: _ => make_keyword("hour"),
    keyword_minute: _ => make_keyword("minute"),
    keyword_second: _ => make_keyword("second"),
    keyword_select: _ => make_keyword("select"),
    keyword_sel: _ => make_keyword("sel"),
    keyword_delete: _ => make_keyword("delete"),
    keyword_del: _ => make_keyword("del"),
    keyword_insert: _ => make_keyword("insert"),
    keyword_ins: _ => make_keyword("ins"),
    keyword_replace: _ => make_keyword("replace"),
    keyword_update: _ => make_keyword("update"),
    keyword_upd: _ => make_keyword("upd"),
    keyword_merge: _ => make_keyword("merge"),
    keyword_show: _ => make_keyword("show"),
    keyword_unload: _ => make_keyword("unload"),
    keyword_into: _ => make_keyword("into"),
    keyword_overwrite: _ => make_keyword("overwrite"),
    keyword_values: _ => make_keyword("values"),
    keyword_value: _ => make_keyword("value"),
    keyword_matched: _ => make_keyword("matched"),
    keyword_set: _ => make_keyword("set"),
    keyword_multiset: _ => make_keyword("multiset"),
    keyword_from: _ => make_keyword("from"),
    keyword_left: _ => make_keyword("left"),
    keyword_right: _ => make_keyword("right"),
    keyword_inner: _ => make_keyword("inner"),
    keyword_full: _ => make_keyword("full"),
    keyword_outer: _ => make_keyword("outer"),
    keyword_cross: _ => make_keyword("cross"),
    keyword_join: _ => make_keyword("join"),
    keyword_on: _ => make_keyword("on"),
    keyword_off: _ => make_keyword("off"),
    keyword_where: _ => make_keyword("where"),
    keyword_order: _ => make_keyword("order"),
    keyword_group: _ => make_keyword("group"),
    keyword_partition: _ => make_keyword("partition"),
    keyword_by: _ => make_keyword("by"),
    keyword_having: _ => make_keyword("having"),
    keyword_desc: _ => make_keyword("desc"),
    keyword_asc: _ => make_keyword("asc"),
    keyword_primary: _ => make_keyword("primary"),
    keyword_create: _ => make_keyword("create"),
    keyword_ct: _ => make_keyword("ct"),
    keyword_alter: _ => make_keyword("alter"),
    keyword_change: _ => make_keyword("change"),
    keyword_explain: _ => make_keyword("explain"),
    keyword_modify: _ => make_keyword("modify"),
    keyword_drop: _ => make_keyword("drop"),
    keyword_add: _ => make_keyword("add"),
    keyword_table: _ => make_keyword("table"),
    keyword_tables: _ => make_keyword("tables"),
    keyword_view: _ => make_keyword("view"),
    keyword_format: _ => make_keyword("format"),
    keyword_title: _ => make_keyword("title"),
    keyword_column: _ => make_keyword("column"),
    keyword_tablespace: _ => make_keyword("tablespace"),
    keyword_sequence: _ => make_keyword("sequence"),
    keyword_increment: _ => make_keyword("increment"),
    keyword_minvalue: _ => make_keyword("minvalue"),
    keyword_maxvalue: _ => make_keyword("maxvalue"),
    keyword_none: _ => make_keyword("none"),
    keyword_owned: _ => make_keyword("owned"),
    keyword_start: _ => make_keyword("start"),
    keyword_restart: _ => make_keyword("restart"),
    keyword_key: _ => make_keyword("key"),
    keyword_duplicate: _ => make_keyword("duplicate"),
    keyword_as: _ => make_keyword("as"),
    keyword_distinct: _ => make_keyword("distinct"),
    keyword_constraint: _ => make_keyword("constraint"),
    keyword_filter: _ => make_keyword("filter"),
    keyword_cast: _ => make_keyword("cast"),
    keyword_trycast: _ => make_keyword("trycast"),
    keyword_separator: _ => make_keyword("separator"),
    keyword_case: _ => make_keyword("case"),
    keyword_when: _ => make_keyword("when"),
    keyword_then: _ => make_keyword("then"),
    keyword_else: _ => make_keyword("else"),
    keyword_end: _ => make_keyword("end"),
    keyword_in: _ => make_keyword("in"),
    keyword_and: _ => make_keyword("and"),
    keyword_or: _ => make_keyword("or"),
    keyword_is: _ => make_keyword("is"),
    keyword_not: _ => make_keyword("not"),
    keyword_ignore: _ => make_keyword("ignore"),
    keyword_using: _ => make_keyword("using"),
    keyword_use: _ => make_keyword("use"),
    keyword_index: _ => make_keyword("index"),
    keyword_period: _ => make_keyword("period"),
    keyword_for: _ => make_keyword("for"),
    keyword_if: _ => make_keyword("if"),
    keyword_exists: _ => make_keyword("exists"),
    keyword_auto_increment: _ => make_keyword("auto_increment"),
    keyword_generated: _ => make_keyword("generated"),
    keyword_always: _ => make_keyword("always"),
    keyword_collate: _ => make_keyword("collate"),
    keyword_character: _ => make_keyword("character"),
    keyword_engine: _ => make_keyword("engine"),
    keyword_default: _ => make_keyword("default"),
    keyword_cascade: _ => make_keyword("cascade"),
    keyword_restrict: _ => make_keyword("restrict"),
    keyword_error: _ => make_keyword("error"),
    keyword_with: _ => make_keyword("with"),
    keyword_without: _ => make_keyword("without"),
    keyword_no: _ => make_keyword("no"),
    keyword_data: _ => make_keyword("data"),
    keyword_type: _ => make_keyword("type"),
    keyword_rename: _ => make_keyword("rename"),
    keyword_to: _ => make_keyword("to"),
    keyword_database: _ => make_keyword("database"),
    keyword_owner: _ => make_keyword("owner"),
    keyword_user: _ => make_keyword("user"),
    keyword_admin: _ => make_keyword("admin"),
    keyword_password: _ => make_keyword("password"),
    keyword_encrypted: _ => make_keyword("encrypted"),
    keyword_valid: _ => make_keyword("valid"),
    keyword_until: _ => make_keyword("until"),
    keyword_connection: _ => make_keyword("connection"),
    keyword_role: _ => make_keyword("role"),
    keyword_reset: _ => make_keyword("reset"),
    keyword_temp: _ => make_keyword("temp"),
    keyword_global: _ => make_keyword("global"),
    keyword_temporary: _ => make_keyword("temporary"),
    keyword_unlogged: _ => make_keyword("unlogged"),
    keyword_logged: _ => make_keyword("logged"),
    keyword_cycle: _ => make_keyword("cycle"),
    keyword_union: _ => make_keyword("union"),
    keyword_all: _ => make_keyword("all"),
    keyword_any: _ => make_keyword("any"),
    keyword_some: _ => make_keyword("some"),
    keyword_except: _ => make_keyword("except"),
    keyword_intersect: _ => make_keyword("intersect"),
    keyword_bt: _ => make_keyword("bt"),
    keyword_et: _ => make_keyword("et"),
    keyword_abort: _ => make_keyword("abort"),
    keyword_begin: _ => make_keyword("begin"),
    keyword_rollback: _ => make_keyword("rollback"),
    keyword_transaction: _ => make_keyword("transaction"),
    keyword_over: _ => make_keyword("over"),
    keyword_nulls: _ => make_keyword("nulls"),
    keyword_first: _ => make_keyword("first"),
    keyword_after: _ => make_keyword("after"),
    keyword_before: _ => make_keyword("before"),
    keyword_last: _ => make_keyword("last"),
    keyword_window: _ => make_keyword("window"),
    keyword_range: _ => make_keyword("range"),
    keyword_rows: _ => make_keyword("rows"),
    keyword_groups: _ => make_keyword("groups"),
    keyword_between: _ => make_keyword("between"),
    keyword_unbounded: _ => make_keyword("unbounded"),
    keyword_preceding: _ => make_keyword("preceding"),
    keyword_following: _ => make_keyword("following"),
    keyword_exclude: _ => make_keyword("exclude"),
    keyword_current: _ => make_keyword("current"),
    keyword_row: _ => make_keyword("row"),
    keyword_ties: _ => make_keyword("ties"),
    keyword_percent: _ => make_keyword("percent"),
    keyword_others: _ => make_keyword("others"),
    keyword_unique: _ => make_keyword("unique"),
    keyword_foreign: _ => make_keyword("foreign"),
    keyword_references: _ => make_keyword("references"),
    keyword_concurrently: _ => make_keyword("concurrently"),
    keyword_btree: _ => make_keyword("btree"),
    keyword_hash: _ => make_keyword("hash"),
    keyword_gist: _ => make_keyword("gist"),
    keyword_spgist: _ => make_keyword("spgist"),
    keyword_gin:  _ => make_keyword("gin"),
    keyword_brin: _ => make_keyword("brin"),
    keyword_like: _ => choice(make_keyword("like"),make_keyword("ilike")),
    keyword_similar: _ => make_keyword("similar"),
    keyword_unsigned: _ => make_keyword("unsigned"),
    keyword_zerofill: _ => make_keyword("zerofill"),
    keyword_conflict: _ => make_keyword("conflict"),
    keyword_do: _ => make_keyword("do"),
    keyword_nothing: _ => make_keyword("nothing"),
    keyword_high_priority: _ => make_keyword("high_priority"),
    keyword_low_priority: _ => make_keyword("low_priority"),
    keyword_delayed: _ => make_keyword("delayed"),
    keyword_recursive: _ => make_keyword("recursive"),
    keyword_local: _ => make_keyword("local"),
    keyword_current_timestamp: _ => make_keyword("current_timestamp"),
    keyword_check: _ => make_keyword("check"),
    keyword_option: _ => make_keyword("option"),
    keyword_wait: _ => make_keyword("wait"),
    keyword_nowait: _ => make_keyword("nowait"),
    keyword_attribute: _ => make_keyword("attribute"),
    keyword_authorization: _ => make_keyword("authorization"),
    keyword_action: _ => make_keyword("action"),
    keyword_extension: _ => make_keyword("extension"),
    keyword_copy: _ => make_keyword("copy"),
    keyword_stdin: _ => make_keyword("stdin"),
    keyword_freeze: _ => make_keyword("freeze"),
    keyword_escape: _ => make_keyword("escape"),
    keyword_encoding: _ => make_keyword("encoding"),
    keyword_force_quote: _ => make_keyword("force_quote"),
    keyword_quote: _ => make_keyword("quote"),
    keyword_force_null: _ => make_keyword("force_null"),
    keyword_force_not_null: _ => make_keyword("force_not_null"),
    keyword_header: _ => make_keyword("header"),
    keyword_match: _ => make_keyword("match"),
    keyword_program: _ => make_keyword("program"),
    keyword_plain: _ => make_keyword("plain"),
    keyword_extended: _ => make_keyword("extended"),
    keyword_main: _ => make_keyword("main"),
    keyword_storage: _ => make_keyword("storage"),
    keyword_compression: _ => make_keyword("compression"),

    keyword_trigger: _ => make_keyword('trigger'),
    keyword_function: _ => make_keyword("function"),
    keyword_returns: _ => make_keyword("returns"),
    keyword_return: _ => make_keyword("return"),
    keyword_setof: _ => make_keyword("setof"),
    keyword_atomic: _ => make_keyword("atomic"),
    keyword_declare: _ => make_keyword("declare"),
    keyword_language: _ => make_keyword("language"),
    keyword_contains: _ => make_keyword("contains"),
    keyword_immutable: _ => make_keyword("immutable"),
    keyword_stable: _ => make_keyword("stable"),
    keyword_volatile: _ => make_keyword("volatile"),
    keyword_called: _ => make_keyword("called"),
    keyword_input: _ => make_keyword("input"),
    keyword_strict: _ => make_keyword("strict"),
    keyword_cost: _ => make_keyword("cost"),
    keyword_rows: _ => make_keyword("rows"),
    keyword_support: _ => make_keyword("support"),
    keyword_definer: _ => make_keyword("definer"),
    keyword_sql: _ => make_keyword("sql"),
    keyword_deterministic: _ => make_keyword("deterministic"),
    keyword_inline: _ => make_keyword("inline"),
    keyword_collation: _ => make_keyword("collation"),
    keyword_invoker: _ => make_keyword("invoker"),
    keyword_security: _ => make_keyword("security"),
    keyword_version: _ => make_keyword("version"),
    keyword_extension: _ => make_keyword("extension"),
    keyword_out: _ => make_keyword("out"),
    keyword_inout: _ => make_keyword("inout"),
    keyword_variadic: _ => make_keyword("variadic"),
    keyword_ordinality: _ => make_keyword("ordinality"),
    keyword_csv: _ => make_keyword("csv"),

    keyword_session: _ => make_keyword("session"),
    keyword_isolation: _ => make_keyword("isolation"),
    keyword_level: _ => make_keyword("level"),
    keyword_serializable: _ => make_keyword("serializable"),
    keyword_repeatable: _ => make_keyword("repeatable"),
    keyword_read: _ => make_keyword("read"),
    keyword_write: _ => make_keyword("write"),
    keyword_committed: _ => make_keyword("committed"),
    keyword_uncommitted: _ => make_keyword("uncommitted"),
    keyword_deferrable: _ => make_keyword("deferrable"),
    keyword_names: _ => make_keyword("names"),
    keyword_zone: _ => make_keyword("zone"),
    keyword_immediate: _ => make_keyword("immediate"),
    keyword_deferred: _ => make_keyword("deferred"),
    keyword_constraints    : _ => make_keyword("constraints"),
    keyword_snapshot: _ => make_keyword("snapshot"),
    keyword_characteristics: _ => make_keyword("characteristics"),
    keyword_follows: _ => make_keyword("follows"),
    keyword_precedes: _ => make_keyword("precedes"),
    keyword_each: _ => make_keyword("each"),
    keyword_instead: _ => make_keyword("instead"),
    keyword_of: _ => make_keyword("of"),
    keyword_initially: _ => make_keyword("initially"),
    keyword_old: _ => make_keyword("old"),
    keyword_new: _ => make_keyword("new"),
    keyword_referencing: _ => make_keyword("referencing"),
    keyword_statement: _ => make_keyword("statement"),
    keyword_exec: _ => make_keyword("exec"),
    keyword_execute: _ => make_keyword("execute"),
    keyword_procedure: _ => make_keyword("procedure"),
    keyword_object_id: _ => make_keyword("object_id"),

    // Hive Keywords
    keyword_external: _ => make_keyword("external"),
    keyword_stored: _ => make_keyword("stored"),
    keyword_virtual: _ => make_keyword("virtual"),
    keyword_cached: _ => make_keyword("cached"),
    keyword_uncached: _ => make_keyword("uncached"),
    keyword_replication: _ => make_keyword("replication"),
    keyword_tblproperties: _ => make_keyword("tblproperties"),
    keyword_stats: _ => make_keyword("stats"),
    keyword_statistics: _ => make_keyword("statistics"),
    keyword_location: _ => make_keyword("location"),
    keyword_partitioned: _ => make_keyword("partitioned"),
    keyword_comment: _ => make_keyword("comment"),
    keyword_sort: _ => make_keyword("sort"),
    keyword_delimited: _ => make_keyword("delimited"),
    keyword_delimiter: _ => make_keyword("delimiter"),
    keyword_fields: _ => make_keyword("fields"),
    keyword_terminated: _ => make_keyword("terminated"),
    keyword_escaped: _ => make_keyword("escaped"),
    keyword_lines: _ => make_keyword("lines"),
    keyword_cache: _ => make_keyword("cache"),

    // Teradata shortcut
    _exec: $ => choice($.keyword_execute, $.keyword_exec),
    _select: $ => choice($.keyword_select, $.keyword_sel),
    _update: $ => choice($.keyword_update, $.keyword_upd),
    _delete: $ => choice($.keyword_delete, $.keyword_del),
    _insert: $ => choice($.keyword_insert, $.keyword_ins),
    _lock: $ => choice($.keyword_lock, $.keyword_locking),
    _stats: $ => choice($.keyword_statistics, $.keyword_stats),


    // Teradata bteq
    keyword_dot_goto: _ => make_keyword(".goto"),
    keyword_dot_label: _ => make_keyword(".label"),
    keyword_dot_if: _ => make_keyword(".if"),
    keyword_dot_quit: _ => make_keyword(".quit"),
    keyword_dot_exit: _ => make_keyword(".exit"),
    keyword_dot_logoff: _ => make_keyword(".logoff"),
    keyword_dot_logon: _ => make_keyword(".logon"),
    keyword_dot_run: _ => make_keyword(".run"),
    keyword_dot_set: _ => make_keyword(".set"),
    keyword_dollar_tdwallet: _ => make_keyword("$tdwallet"),
    keyword_skip: _ => make_keyword("skip"),
    keyword_file: _ => make_keyword("file"),
    keyword_defaults: _ => make_keyword("defaults"),

    // Teradata procedure
    keyword_cursor: _ => make_keyword("cursor"),
    keyword_continue: _ => make_keyword("continue"),
    keyword_sqlstate: _ => make_keyword("sqlstate"),
    keyword_found: _ => make_keyword("found"),
    keyword_sqlwarning: _ => make_keyword("sqlwarning"),
    keyword_sqlexception: _ => make_keyword("sqlexception"),
    keyword_exit: _ => make_keyword("exit"),
    keyword_condition: _ => make_keyword("condition"),
    keyword_handler: _ => make_keyword("handler"),
    keyword_leave: _ => make_keyword("leave"),
    keyword_call: _ => make_keyword("call"),
    keyword_glop: _ => make_keyword("glop"),
    keyword_dynamic: _ => make_keyword("dynamic"),
    keyword_result: _ => make_keyword("result"),
    keyword_sets: _ => make_keyword("sets"),
    keyword_parameter: _ => make_keyword("parameter"),
    keyword_style: _ => make_keyword("style"),
    keyword_td_general: _ => make_keyword("td_general"),
    keyword_java: _ => make_keyword("java"),
    keyword_creator: _ => make_keyword("creator"),
    keyword_c: _ => make_keyword("c"),
    keyword_cpp: _ => make_keyword("cpp"),
    keyword_modifies: _ => make_keyword("modifies"),
    keyword_reads: _ => make_keyword("reads"),

    // Period operators
    keyword_overlaps: _ => make_keyword("overlaps"),
    keyword_equals: _ => make_keyword("equals"),
    keyword_immediately: _ => make_keyword("immediately"),
    keyword_succeeds: _ => make_keyword("succeeds"),
    keyword_meets: _ => make_keyword("meets"),
    keyword_ldiff: _ => make_keyword("ldiff"),
    keyword_rdiff: _ => make_keyword("rdiff"),
    keyword_p_intersect: _ => make_keyword("p_intersect"),

    // Pivot aggregate function
    keyword_avg: _ => make_keyword("avg"),
    keyword_max: _ => make_keyword("max"),
    keyword_min: _ => make_keyword("min"),
    keyword_sum: _ => make_keyword("sum"),

    // Operators
    is_not: $ => prec.left(seq($.keyword_is, $.keyword_not)),
    not_like: $ => seq($.keyword_not, $.keyword_like),
    similar_to: $ => seq($.keyword_similar, $.keyword_to),
    not_similar_to: $ => seq($.keyword_not, $.keyword_similar, $.keyword_to),
    distinct_from: $ => seq($.keyword_is, $.keyword_distinct, $.keyword_from),
    not_distinct_from: $ => seq($.keyword_is, $.keyword_not, $.keyword_distinct, $.keyword_from),

    _temporary: $ => choice($.keyword_temp, $.keyword_temporary),
    _not_null: $ => seq($.keyword_not, $.keyword_null),
    _primary_key: $ => seq($.keyword_primary, $.keyword_key),
    _if_exists: $ => seq($.keyword_if, $.keyword_exists),
    _if_not_exists: $ => seq($.keyword_if, $.keyword_not, $.keyword_exists),
    _default_null: $ => seq($.keyword_default, $.keyword_null),
    _current_row: $ => seq($.keyword_current, $.keyword_row),
    _exclude_current_row: $ => seq($.keyword_exclude, $.keyword_current, $.keyword_row),
    _exclude_group: $ => seq($.keyword_exclude, $.keyword_group),
    _exclude_no_others: $ => seq($.keyword_exclude, $.keyword_no, $.keyword_others),
    _exclude_ties: $ => seq($.keyword_exclude, $.keyword_ties),
    _check_option: $ => seq($.keyword_check, $.keyword_option),
    direction: $ => choice($.keyword_desc, $.keyword_asc),

    // Types
    keyword_null: _ => make_keyword("null"),
    keyword_true: _ => make_keyword("true"),
    keyword_false: _ => make_keyword("false"),

    keyword_boolean: _ => make_keyword("boolean"),
    keyword_bit: _ => make_keyword("bit"),
    keyword_binary: _ => make_keyword("binary"),
    keyword_varbinary: _ => make_keyword("varbinary"),
    keyword_image: _ => make_keyword("image"),

    keyword_smallserial: _ => choice(make_keyword("smallserial"),make_keyword("serial2")),
    keyword_serial: _ => choice(make_keyword("serial"),make_keyword("serial4")),
    keyword_bigserial: _ => choice(make_keyword("bigserial"),make_keyword("serial8")),
    keyword_tinyint: _ => choice(make_keyword("tinyint"),make_keyword("int1")),
    keyword_smallint: _ => choice(make_keyword("smallint"),make_keyword("int2")),
    keyword_mediumint: _ => choice(make_keyword("mediumint"),make_keyword("int3")),
    keyword_int: _ => choice(make_keyword("int"), make_keyword("integer"), make_keyword("int4")),
    keyword_bigint: _ => choice(make_keyword("bigint"),make_keyword("int8")),
    keyword_byteint: _ => make_keyword("byteint"),
    keyword_decimal: _ => make_keyword("decimal"),
    keyword_numeric: _ => make_keyword("numeric"),
    keyword_real: _ => choice(make_keyword("real"),make_keyword("float4")),
    keyword_float: _ => make_keyword("float"),
    keyword_double: _ => make_keyword("double"),
    keyword_precision: _ => make_keyword("precision"),
    keyword_inet: _ => make_keyword("inet"),

    keyword_money: _ => make_keyword("money"),
    keyword_smallmoney: _ => make_keyword("smallmoney"),
    keyword_varying: _ => make_keyword("varying"),

    keyword_char: _ => choice(make_keyword("char"), make_keyword("character")),
    keyword_nchar: _ => make_keyword("nchar"),
    keyword_varchar: $ => choice(
      make_keyword("varchar"),
      seq(
        make_keyword("character"),
        $.keyword_varying,
      )
    ),
    keyword_nvarchar: _ => make_keyword("nvarchar"),
    keyword_text: _ => make_keyword("text"),
    keyword_string: _ => make_keyword("string"),
    keyword_uuid: _ => make_keyword("uuid"),

    keyword_json: _ => make_keyword("json"),
    keyword_jsonb: _ => make_keyword("jsonb"),
    keyword_xml: _ => make_keyword("xml"),

    keyword_bytea: _ => make_keyword("bytea"),

    keyword_enum: _ => make_keyword("enum"),

    keyword_date: _ => make_keyword("date"),
    keyword_datetime: _ => make_keyword("datetime"),
    keyword_datetime2: _ => make_keyword("datetime2"),
    keyword_smalldatetime: _ => make_keyword("smalldatetime"),
    keyword_datetimeoffset: _ => make_keyword("datetimeoffset"),
    keyword_time: _ => make_keyword("time"),
    keyword_timestamp: _ => make_keyword("timestamp"),
    keyword_timestamptz: _ => make_keyword('timestamptz'),
    keyword_interval: _ => make_keyword("interval"),

    keyword_geometry: _ => make_keyword("geometry"),
    keyword_geography: _ => make_keyword("geography"),
    keyword_box2d: _ => make_keyword("box2d"),
    keyword_box3d: _ => make_keyword("box3d"),

    keyword_oid: _ => make_keyword("oid"),
    keyword_oids: _ => make_keyword("oids"),
    keyword_name: _ => make_keyword("name"),
    keyword_regclass: _ => make_keyword("regclass"),
    keyword_regnamespace: _ => make_keyword("regnamespace"),
    keyword_regproc: _ => make_keyword("regproc"),
    keyword_regtype: _ => make_keyword("regtype"),

    keyword_array: _ => make_keyword("array"), // not included in _type since it's a constructor literal

    _type: $ => prec.left(
      seq(
        choice(
          $.keyword_boolean,
          $.bit,
          $.binary,
          $.varbinary,
          $.keyword_image,

          $.keyword_smallserial,
          $.keyword_serial,
          $.keyword_bigserial,

          $.tinyint,
          $.smallint,
          $.mediumint,
          $.int,
          $.byteint,
          $.bigint,
          $.decimal,
          $.numeric,
          $.double,
          $.float,

          $.keyword_money,
          $.keyword_smallmoney,

          $.char,
          $.varchar,
          $.nchar,
          $.nvarchar,
          $.numeric,
          $.keyword_string,
          $.keyword_text,

          $.keyword_uuid,

          $.keyword_json,
          $.keyword_jsonb,
          $.keyword_xml,

          $.keyword_bytea,
          $.keyword_inet,

          $.enum,

          $.keyword_date,
          $.keyword_datetime,
          $.keyword_datetime2,
          seq(optional($.keyword_as), $.keyword_transactiontime),
          $.datetimeoffset,
          $.keyword_smalldatetime,
          $.time,
          $.timestamp,
          $.keyword_timestamptz,
          $.keyword_interval,

          $.keyword_geometry,
          $.keyword_geography,
          $.keyword_box2d,
          $.keyword_box3d,

          $.keyword_oid,
          // $.keyword_name,
          $.keyword_regclass,
          $.keyword_regnamespace,
          $.keyword_regproc,
          $.keyword_regtype,

          $.format,

          // TODO : find a way to make this work with teradata implicit cast
          // field("custom_type", $.object_reference)
        ),
        optional($.array_size_definition)
      ),
    ),

    array_size_definition: $ => prec.left(
      choice(
        seq($.keyword_array, optional($._array_size_definition)),
        repeat1($._array_size_definition),
      ),
    ),

    _array_size_definition: $ => seq(
      '[',
      optional(field("size", alias($._integer, $.literal))),
      ']'
    ),

    tinyint: $ => unsigned_type($, parametric_type($, $.keyword_tinyint)),
    smallint: $ => unsigned_type($, parametric_type($, $.keyword_smallint)),
    mediumint: $ => unsigned_type($, parametric_type($, $.keyword_mediumint)),
    int: $ => unsigned_type($, parametric_type($, $.keyword_int)),
    bigint: $ => unsigned_type($, parametric_type($, $.keyword_bigint)),
    byteint: $ => unsigned_type($, parametric_type($, $.keyword_byteint)),

    bit: $ => choice(
        $.keyword_bit,
        seq(
            $.keyword_bit,
            prec(0, parametric_type($, $.keyword_varying, ['precision'])),
        ),
        prec(1, parametric_type($, $.keyword_bit, ['precision'])),
    ),

    binary: $ => parametric_type($, $.keyword_binary, ['precision']),
    varbinary: $ => parametric_type($, $.keyword_varbinary, ['precision']),

    // TODO: should qualify against /\\b(0?[1-9]|[1-4][0-9]|5[0-4])\\b/g
    float: $  => choice(
      parametric_type($, $.keyword_float, ['precision']),
      unsigned_type($, parametric_type($, $.keyword_float, ['precision', 'scale'])),
    ),

    double: $ => choice(
      make_keyword("float8"),
      unsigned_type($, parametric_type($, $.keyword_double, ['precision', 'scale'])),
      unsigned_type($, parametric_type($, seq($.keyword_double, $.keyword_precision), ['precision', 'scale'])),
      unsigned_type($, parametric_type($, $.keyword_real, ['precision', 'scale'])),
    ),

    decimal: $ => choice(
      parametric_type($, $.keyword_decimal, ['precision']),
      parametric_type($, $.keyword_decimal, ['precision', 'scale']),
    ),
    numeric: $ => choice(
      parametric_type($, $.keyword_numeric, ['precision']),
      parametric_type($, $.keyword_numeric, ['precision', 'scale']),
    ),
    char: $ => parametric_type($, $.keyword_char),
    varchar: $ => parametric_type($, $.keyword_varchar),
    nchar: $ => parametric_type($, $.keyword_nchar),
    nvarchar: $ => parametric_type($, $.keyword_nvarchar),

    _include_time_zone: $ => seq(
      choice($.keyword_with, $.keyword_without),
      $.keyword_time,
      $.keyword_zone,
    ),
    datetimeoffset: $ => parametric_type($, $.keyword_datetimeoffset),
    time: $ => seq(
      parametric_type($, $.keyword_time),
      optional($._include_time_zone),
    ),
    timestamp: $ => seq(
      parametric_type($, $.keyword_timestamp),
      optional($._include_time_zone),
    ),
    timestamptz: $ => parametric_type($, $.keyword_timestamptz),

    enum: $ => seq(
      $.keyword_enum,
      paren_list(field("value", alias($._literal_string, $.literal)), true)
    ),

    array: $ => seq(
      $.keyword_array,
      choice(
        seq(
          "[",
          comma_list($._expression),
          "]"
        ),
        seq(
          "(",
          $._dml_read,
          ")",
        )
      )
    ),

    comment: _ => /--.*/,
    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment
    marginalia: _ => /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//,

    transaction: $ => seq(
      seq($.keyword_bt, ';'),
      repeat(
        choice(
          seq(
            $.statement,
            ';'
          ),
          seq($.bteq_statement, optional(';')),
        ),
      ),
      choice(
        $._commit,
        $._rollback,
      ),
    ),

    _commit: $ => seq(
      $.keyword_et,
    ),

    _rollback: $ => seq(
      choice(seq($.keyword_rollback, optional( $.keyword_transaction,)),
            $.keyword_abort),
    ),

    block: $ => seq(
      $.keyword_begin,
      optional(';'),
      repeat(
        seq(
          $.statement,
          ';'
        ),
      ),
      $.keyword_end,
    ),

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
      $._alter_statement,
      $._drop_statement,
      $._rename_statement,
      $._merge_statement,
      $.comment_statement,
      $.set_statement,
      $.reset_statement,
    ),



  bteq_statement: $ => choice(
    $._bteq_if_statement,
    $._goto_statement,
    $._logon_statement,
    $._quit_statement,
    $._label_statement,
    $._bteq_set_statement,
    $._bteq_run_statement,
    $.keyword_dot_exit,
    $.keyword_dot_logoff
  ),

  _bteq_if_statement: $ => seq(
    $.keyword_dot_if,
    $._expression,
    $.keyword_then,
    $.bteq_statement,
  ),

  _bteq_run_statement: $ => seq(
    $.keyword_dot_run,
    $.keyword_file,
    '=',
    choice($.object_reference, $.literal),
    optional(seq($.keyword_skip, $._integer)),
  ),

  _bteq_set_statement: $ => seq(
    $.keyword_dot_set,
    choice($.keyword_defaults,
      seq($.object_reference, choice($.object_reference, $.literal))
      ),
  ),

  _label_statement: $ => seq($.keyword_dot_label, $.object_reference),
  _goto_statement: $ => seq($.keyword_dot_goto, $.object_reference),
  _quit_statement: $ => seq($.keyword_dot_quit, $._integer),
  _logon_statement: $ => seq($.keyword_dot_logon, $.object_reference, '/', $.object_reference, ',' ,
                            choice(
                              seq(optional('\\'), $.keyword_dollar_tdwallet, wrapped_in_parenthesis($.object_reference)),
                              $.object_reference,
                            )
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

    // athena
    _unload_statement: $ => seq(
      $.keyword_unload,
      wrapped_in_parenthesis($._select_statement),
      $.keyword_to,
      $._single_quote_string,
      $.storage_parameters,
    ),

    _show_statement: $ => seq(
      $.keyword_show,
      choice(
        $.keyword_table,
        $.keyword_view,
        $.keyword_macro,
        $.keyword_function,
        seq($._stats, $.keyword_on),
      ),
      $.object_reference,
    ),

    _collect_statement: $ => seq(
      $.keyword_collect,
      choice($._stats),
      choice(
        seq($.keyword_on, $.object_reference, $.keyword_column, field('value', $.object_reference)),
        seq(
          $.keyword_column, wrapped_in_parenthesis(comma_list(field('value', $.object_reference))),
          repeat(seq(',', $.keyword_column, wrapped_in_parenthesis(comma_list(field('value', $.object_reference))))),
          $.keyword_on,
          $.object_reference,
          )
        )
    ),

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
          $.from
        ),
      ),
    ),

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
      seq($.keyword_tablespace, $.identifier),
      // TODO: text search (configuration|dictionary|parser|template)
      // TODO: transform for
      seq($.keyword_trigger, $.identifier, $.keyword_on, $.object_reference),
      seq($.keyword_type, $.identifier),
      seq($.keyword_view, $.object_reference),
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

    lock_clause: $ => choice(
      seq($._lock, $.keyword_row, $.keyword_for, choice($.keyword_read, $.keyword_write, $.keyword_access)),
        repeat1(
          seq($._lock, optional(choice($.keyword_table, $.keyword_view)), $.object_reference, $.keyword_for,
            choice($.keyword_read, $.keyword_write, $.keyword_access)),
          ),
      ),

    top_clause: $ => seq(
      $.keyword_top,
      field('top_value', alias($._integer, $.literal)),
      optional($.keyword_percent),
      optional(seq($.keyword_with, $.keyword_ties))
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

    _delete_statement: $ => seq(
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

    _create_statement: $ => seq(
      choice(
        $.create_table,
        $.create_view,
        $.create_index,
        $.create_function,
        $.create_procedure,
        $.create_type,
        $.create_database,
        $.create_role,
        $.create_macro,
        $.create_sequence,
        $.create_extension,
        $.create_trigger,
        $.create_join_index,
      ),
    ),

    _table_settings: $ => choice(
      $.table_partition,
      $.storage_location,
      $.table_sort,
      $.row_format,
      seq(
        $.keyword_tblproperties,
        paren_list($.table_option, true),
      ),
      seq($.keyword_without, $.keyword_oids),
      $.storage_parameters,
      $.table_option,
      $.primary_index_clause,
      $.partition_by_clause,
      seq($.keyword_no, $.keyword_primary, $.keyword_index),
    ),

    storage_parameters: $ => seq(
      $.keyword_with,
      paren_list(
        seq($.identifier, optional(seq('=', choice($.literal, $.array)))),
        true
      ),
    ),

    // left precedence because 'quoted' table options otherwise conflict with
    // `create function` string bodies; if you remove this precedence you will
    // have to also disable the `_literal_string` choice for the `name` field
    // in =-assigned `table_option`s
    create_table: $ => prec.left(
      seq(
        choice($.keyword_ct,
          seq(
              $.keyword_create,
              optional(
                choice(
                  $._temporary,
                  $.keyword_unlogged,
                  $.keyword_external,
                  $.keyword_multiset,
                  $.keyword_set,
                  $.keyword_volatile,
                  seq($.keyword_global, $.keyword_temporary),
                )
              ),
              $.keyword_table,
            ),
          ),
        optional($._if_not_exists),
        $.object_reference,
        choice(
          seq(
            $.column_definitions,
            repeat($._table_settings),
            optional(
              seq(
                $.keyword_as,
                $._select_statement,
              ),
            )
          ),
          seq(
            repeat($._table_settings),
            seq(
              $.keyword_as,
              $.create_query,
            ),
          ),
        ),
      ),
    ),

    reset_statement: $ => seq(
      $.keyword_reset,
      choice(
        $.object_reference,
        $.keyword_all,
        seq($.keyword_session, $.keyword_authorization),
        $.keyword_role,
      ),
    ),

    _transaction_mode: $ => seq(
      $.keyword_isolation,
      $.keyword_level,
      choice(
        $.keyword_serializable,
        seq($.keyword_repeatable, $.keyword_read),
        seq($.keyword_read, $.keyword_committed),
        seq($.keyword_read, $.keyword_uncommitted),
      ),
      choice(
        seq($.keyword_read, $.keyword_write),
        seq($.keyword_read),
      ),
      optional($.keyword_not),
      $.keyword_deferrable,
    ),

    set_statement: $ => seq(
      $.keyword_set,
      choice(
        seq(
          optional(choice($.keyword_session, $.keyword_local)),
          choice(
            seq(
              $.object_reference,
              choice($.keyword_to, '='),
              choice(
                $.literal,
                $.keyword_default,
                $.identifier,
                $.keyword_on,
                $.keyword_off,
                $.binary_expression,
              ),
            ),
            seq($.keyword_names, $.literal),
            seq($.keyword_time, $.keyword_zone, choice($.literal, $.keyword_local, $.keyword_default)),
            seq($.keyword_session, $.keyword_authorization, choice($.identifier, $.keyword_default)),
            seq($.keyword_role, choice($.identifier, $.keyword_none)),
          ),
        ),
        seq($.keyword_constraints, choice($.keyword_all, comma_list($.identifier, true)), choice($.keyword_deferred, $.keyword_immediate)),
        seq($.keyword_transaction, $._transaction_mode),
        seq($.keyword_transaction, $.keyword_snapshot, $._transaction_mode),
        seq($.keyword_session, $.keyword_characteristics, $.keyword_as, $.keyword_transaction, $._transaction_mode),
      ),
    ),

    create_query: $ => $._dml_read,

    create_view: $ => prec.right(
      seq(
        choice($.keyword_create, $.keyword_replace),
        optional($._temporary),
        optional($.keyword_recursive),
        $.keyword_view,
        optional($._if_not_exists),
        $.object_reference,
        optional(paren_list($.identifier)),
        $.keyword_as,
        $.create_query,
        optional(
          seq(
            $.keyword_with,
            optional(
                $.keyword_local,
            ),
            $._check_option,
          ),
        ),
      ),
    ),

    create_join_index: $ => prec.right(
      seq(
        $.keyword_create, $.keyword_join, $.keyword_index,
        $.object_reference,
        //missing table options
        $.keyword_as,
        $.create_query,
        optional(seq($.primary_index_clause, $.partition_by_clause)),
      ),
    ),

    //SQL_Data_Definition_Language_Syntax-172K.pdf
    create_procedure: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_procedure,
      $.object_reference,
      $.procedure_arguments,
      repeat(
        choice(
          $.procedure_security,
          $.procedure_dynamic,
          $.procedure_language_and_access_specification,
          $.procedure_parameter_style_specification,
          $.procedure_glop,
          $.procedure_external_security,
          $.procedure_external_name,
        ),
      ),
      $.procedure_body, //TODO
    ),

    procedure_body: $ => seq(
      $.compound_statement,
    ),

    compound_statement: $ => choice(
      seq(
        optional(seq($.object_reference, ':')),
        $.keyword_begin,
        repeat1($._create_procedure_statement),
        $.keyword_end,
      ),
    ),

    _create_procedure_statement: $ => seq(
      $._procedure_body_statement,
      ';'
    ),


    _procedure_body_statement: $ => choice(
      $.leave_statement,
      $.declare_statement,
      $.procedure_if_statement, //TODO ELSEIF
      $.procedure_for_statement,
      $.statement,
      $.compound_statement,
    ),

    procedure_for_statement: $ => seq(
      $.keyword_for, $.identifier, $.keyword_as,
      $.identifier, $.keyword_cursor, $.keyword_for,
      $.statement,
      $.keyword_do,
      repeat1($._create_procedure_statement),
      $.keyword_end, $.keyword_for
    ),

    procedure_if_statement: $ => seq(
      $.keyword_if, $._expression, $.keyword_then,
      repeat1($._create_procedure_statement),
      optional($.procedure_else_statement),
      $.keyword_end, $.keyword_if,
    ),

    procedure_else_statement: $ => seq(
      $.keyword_else,
      repeat1($._create_procedure_statement),
    ),

    leave_statement: $ => seq($.keyword_leave, $.identifier),

    declare_statement: $ => choice(
        seq($.keyword_declare, $.identifier, $._type),
        seq(
          $.keyword_declare,
          $.identifier,
          $.keyword_condition,
          $.keyword_for,
          choice($.keyword_sqlexception, $.keyword_sqlwarning, seq($.keyword_not, $.keyword_found), $.identifier, seq($.keyword_sqlstate, $._integer)),
        ),
        seq(
          $.keyword_declare,
          choice($.keyword_continue, $.keyword_exit),
          $.keyword_handler,
          $.keyword_for,
          choice($.keyword_sqlexception, $.keyword_sqlwarning, seq($.keyword_not, $.keyword_found), $.identifier, seq($.keyword_sqlstate, $._integer)),
          $.compound_statement,
        )
      ),


    procedure_external_name: $ => seq($.keyword_external, $.keyword_name, $.object_reference),
    procedure_external_security: $ => seq($.keyword_external, $.keyword_security, choice($.keyword_invoker, seq($.keyword_definer, $.object_reference))),
    procedure_glop: $ => seq($.keyword_using, $.keyword_glop, $.keyword_set, $.object_reference),
    procedure_dynamic: $ => seq($.keyword_dynamic, $.keyword_result, $.keyword_sets, $._integer),
    procedure_parameter_style_specification : $ => seq($.keyword_parameter, $.keyword_style, choice($.keyword_sql, $.keyword_td_general, $.keyword_java)),

    procedure_security: $ => seq(
      $.keyword_sql,
      $.keyword_security,
      choice($.keyword_invoker, $.keyword_definer, $.keyword_creator, $.keyword_owner),
    ),

    procedure_language_and_access_specification: $ => seq(
      seq($.keyword_language, choice(
            $.keyword_c,
            $.keyword_cpp,
            $.keyword_java)),
      repeat(choice(
              seq($.keyword_contains, $.keyword_sql),
              seq(choice($.keyword_modifies, $.keyword_reads),
                  $.keyword_sql, $.keyword_data),
              seq($.keyword_no, $.keyword_sql),
              )
            ),
      optional(seq(
                choice($.keyword_modifies, $.keyword_reads, $.keyword_no),
                $.keyword_external,
                $.keyword_data))
    ),

    _proc_argmode: $ => choice(
      $.keyword_in,
      $.keyword_out,
      $.keyword_inout,
    ),

    procedure_argument: $ => seq(
      $._argmode,
      $.identifier,
      $._type,
    ),

    procedure_arguments: $ => paren_list(
      $.procedure_argument,
      false,
    ),

    // This is only used in create function statement, it is not needed to check
    // the start tag match the end one. The usage of this syntax in other
    // context is done by _dollar_string.
    dollar_quote: () => /\$[^\$]*\$/,

    create_function: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_function,
      $.object_reference,
      $.function_arguments,
      $.keyword_returns,
      choice(
        $._type,
        seq($.keyword_setof, $._type),
        seq($.keyword_table, $.column_definitions),
        $.keyword_trigger,
      ),
      repeat(
        choice(
          $.function_language,
          $.function_volatility,
          $.function_security,
          $.function_mandatory,
          $.function_strictness,
          $.function_cost,
          $.function_rows,
          $.function_support,
          $.function_deterministic,
        ),
      ),
      // ensure that there's only one function body -- other specifiers are less
      // variable but the body can have all manner of conflicting stuff
      $.function_body,
      repeat(
        choice(
          $.function_language,
          $.function_volatility,
          $.function_security,
          $.function_mandatory,
          $.function_strictness,
          $.function_cost,
          $.function_rows,
          $.function_support,
          $.function_deterministic,
        ),
      ),
    ),

    _function_return: $ => seq(
      $.keyword_return,
      $._expression,
    ),

    function_declaration: $ => seq(
      $.identifier,
      $._type,
      optional(
        seq(
          ':=',
          choice(
            wrapped_in_parenthesis($.statement),
            // TODO are there more possibilities here? We can't use `_expression` since
            // that includes subqueries
            $.literal,
          ),
        ),
      ),
      ';',
    ),

    _function_body_statement: $ => choice(
      $.statement,
      $._function_return,
    ),

    function_body: $ => choice(
      seq(
        $._function_return,
        ';'
      ),
      seq(
        $.keyword_begin,
        $.keyword_atomic,
        repeat1(
          seq(
            $._function_body_statement,
            ';',
          ),
        ),
        $.keyword_end,
      ),
      seq(
        $.keyword_as,
        alias($._dollar_quoted_string_start_tag, $.dollar_quote),
        optional(
          seq(
            $.keyword_declare,
            repeat1(
              $.function_declaration,
            ),
          ),
        ),
        $.keyword_begin,
        repeat1(
          seq(
            $._function_body_statement,
            ';',
          ),
        ),
        $.keyword_end,
        optional(';'),
        alias($._dollar_quoted_string_end_tag, $.dollar_quote),
      ),
      seq(
        $.keyword_as,
        alias(
          choice(
            $._single_quote_string,
            $._double_quote_string,
          ),
          $.literal
        ),
      ),
      seq(
        $.keyword_as,
        alias($._dollar_quoted_string_start_tag, $.dollar_quote),
        $._function_body_statement,
        optional(';'),
        alias($._dollar_quoted_string_end_tag, $.dollar_quote),
      ),
    ),

    function_language: $ => seq(
      $.keyword_language,
      $.identifier,
      optional(seq($.keyword_contains,
              $.identifier,))
    ),

    function_volatility: $ => choice(
      $.keyword_immutable,
      $.keyword_stable,
      $.keyword_volatile,
    ),

    function_security: $ => seq(
      optional($.keyword_external),
      optional($.keyword_sql),
      $.keyword_security,
      choice($.keyword_invoker, $.keyword_definer),
    ),

    function_mandatory: $ => seq(
      choice(
        seq($.keyword_collation, $.keyword_invoker),
        seq($.keyword_inline, $.keyword_type, '1')
      )
    ),

    function_deterministic: $ => seq(
      optional($.keyword_not),
      $.keyword_deterministic,
    ),

    function_strictness: $ => choice(
      seq(
        choice(
          $.keyword_called,
          seq(
            $.keyword_returns,
            $.keyword_null,
          ),
        ),
        $.keyword_on,
        $.keyword_null,
        $.keyword_input,
      ),
      $.keyword_strict,
    ),

    function_cost: $ => seq(
      $.keyword_cost,
      $._natural_number,
    ),

    function_rows: $ => seq(
      $.keyword_rows,
      $._natural_number,
    ),

    function_support: $ => seq(
      $.keyword_support,
      alias($._literal_string, $.literal),
    ),

    create_macro: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      $.keyword_macro,
      $.object_reference,
      optional(wrapped_in_parenthesis(comma_list($.column_definition))),
      $.keyword_as,
      '(',
        repeat1(
          seq(
            $.statement,
            ';'
          ),
        ),
       ')',
    ),

    _operator_class: $ => seq(
      field("opclass", $.identifier),
      optional(
        field("opclass_parameters", wrapped_in_parenthesis(comma_list($.term)))
      )
    ),

    _index_field: $ => seq(
      choice(
        field("expression", wrapped_in_parenthesis($._expression)),
        field("function", $.invocation),
        field("column", $._column),
      ),
      optional(seq($.keyword_collate, $.identifier)),
      optional($._operator_class),
      optional($.direction),
      optional(
        seq(
          $.keyword_nulls,
          choice(
            $.keyword_first,
            $.keyword_last
          )
        )
      ),
    ),

    index_fields: $ => wrapped_in_parenthesis(comma_list(alias($._index_field, $.field))),

    create_index: $ => seq(
      $.keyword_create,
      optional($.keyword_unique),
      $.keyword_index,
      optional($.keyword_concurrently),
      optional(
        seq(
          optional($._if_not_exists),
          field("column", $._column),
        ),
      ),
      $.keyword_on,
      seq(
        $.object_reference,
        optional(
          seq(
            $.keyword_using,
            choice(
              $.keyword_btree,
              $.keyword_hash,
              $.keyword_gist,
              $.keyword_spgist,
              $.keyword_gin,
              $.keyword_brin
            ),
          ),
        ),
        $.index_fields
      ),
      optional(
        $.where,
      ),
    ),

    _with_settings: $ => seq(
          field('name', $.identifier),
          optional('='),
          field('value', choice($.identifier, alias($._single_quote_string, $.literal))),
    ),

    create_database: $ => seq(
      $.keyword_create,
      $.keyword_database,
      optional($._if_not_exists),
      $.identifier,
      optional($.keyword_with),
      repeat(
        $._with_settings
      ),
    ),

    create_role: $ => seq(
      $.keyword_create,
      choice(
        $.keyword_user,
        $.keyword_role,
        $.keyword_group,
      ),
      $.identifier,
      optional($.keyword_with),
      repeat(
        choice(
          $._user_access_role_config,
          $._role_options,
        ),
      ),
    ),

    _role_options: $ => choice(
      field("option", $.identifier),
      seq(
        $.keyword_valid,
        $.keyword_until,
        field("valid_until", alias($._literal_string, $.literal))
      ),
      seq(
        $.keyword_connection,
      ),
      seq(
        optional($.keyword_encrypted),
        $.keyword_password,
        choice(
          field("password", alias($._literal_string, $.literal)),
          $.keyword_null,
        ),
      ),
    ),

    _user_access_role_config: $ => seq(
      choice(
        seq(optional($.keyword_in), $.keyword_role),
        seq($.keyword_in, $.keyword_group),
        $.keyword_admin,
        $.keyword_user,
      ),
      comma_list($.identifier, true),
    ),

    create_sequence: $ => seq(
      $.keyword_create,
      optional(
        choice(
          choice($.keyword_temporary, $.keyword_temp),
          $.keyword_unlogged,
        )
      ),
      $.keyword_sequence,
      optional($._if_not_exists),
      $.object_reference,
      repeat(
        choice(
          seq($.keyword_as, $._type),
          seq($.keyword_increment, optional($.keyword_by), field("increment", alias($._integer, $.literal))),
          seq($.keyword_minvalue, choice($.literal, seq($.keyword_no, $.keyword_minvalue))),
          seq($.keyword_no, $.keyword_minvalue),
          seq($.keyword_maxvalue, choice($.literal, seq($.keyword_no, $.keyword_maxvalue))),
          seq($.keyword_no, $.keyword_maxvalue),
          seq($.keyword_start, optional($.keyword_with), field("start", alias($._integer, $.literal))),
          seq($.keyword_cache, field("cache", alias($._integer, $.literal))),
          seq(optional($.keyword_no), $.keyword_cycle),
          seq($.keyword_owned, $.keyword_by, choice($.keyword_none, $.object_reference)),
        )
      ),
    ),

    create_extension: $ => seq(
      $.keyword_create,
      $.keyword_extension,
      optional($._if_not_exists),
      $.identifier,
      optional($.keyword_with),
      optional(seq($.keyword_version, choice($.identifier, alias($._literal_string, $.literal)))),
      optional($.keyword_cascade),
    ),

    create_trigger: $ => seq(
      choice($.keyword_create, $.keyword_replace),
      // mariadb
      optional(seq($.keyword_definer, '=', $.identifier)),
      optional($.keyword_constraint),
      // sqlite
      optional($._temporary),
      $.keyword_trigger,
      // sqlite/mariadb
      optional($._if_not_exists),
      $.object_reference,
      choice(
        $.keyword_before,
        $.keyword_after,
        seq($.keyword_instead, $.keyword_of),
      ),
      $._create_trigger_event,
      repeat(seq($.keyword_or, $._create_trigger_event)),
      $.keyword_on,
      $.object_reference,
      repeat(
        choice(
          seq($.keyword_from, $.object_reference),
          choice(
            seq($.keyword_not, $.keyword_deferrable),
            $.keyword_deferrable,
            seq($.keyword_initially, $.keyword_immediate),
            seq($.keyword_initially, $.keyword_deferred),
          ),
          seq($.keyword_referencing, choice($.keyword_old, $.keyword_new), $.keyword_table, optional($.keyword_as), $.identifier),
          seq(
            $.keyword_for,
            optional($.keyword_each),
            choice($.keyword_row, $.keyword_statement),
            // mariadb
            optional(seq(choice($.keyword_follows, $.keyword_precedes), $.identifier)),
          ),
          seq($.keyword_when, wrapped_in_parenthesis($._expression)),
        ),
      ),
      $._exec,
      choice($.keyword_function, $.keyword_procedure),
      $.object_reference,
      paren_list(field('parameter', $.term)),
    ),

    _create_trigger_event: $ => choice(
      $._insert,
      seq(
        $._update,
        optional(
          seq(
            $.keyword_of,
            comma_list($.identifier, true),
          ),
        ),
      ),
      $._delete,
    ),

    create_type: $ => seq(
      $.keyword_create,
      $.keyword_type,
      $.object_reference,
      optional(
        seq(
          choice(
            seq(
              $.keyword_as,
              $.column_definitions,
              optional(seq($.keyword_collate, $.identifier))
            ),
            seq(
              $.keyword_as,
              $.keyword_enum,
              $.enum_elements,
            ),
            seq(
              optional(
                seq(
                  $.keyword_as,
                  $.keyword_range,
                )
              ),
              paren_list(
                $._with_settings
              ),
            ),
          ),
        ),
      ),
    ),

    enum_elements: $ => seq(
      paren_list(field("enum_element", alias($._literal_string, $.literal))),
    ),

    _alter_statement: $ => seq(
      choice(
        $.alter_table,
        $.alter_view,
        $.alter_type,
        $.alter_index,
        $.alter_database,
        $.alter_role,
        $.alter_sequence,
      ),
    ),

    _rename_statement: $ => seq(
      $.keyword_rename,
      choice(
        $.keyword_table,
        $.keyword_tables,
      ),
      optional($._if_exists),
      $.object_reference,
      optional(
        choice(
          $.keyword_nowait,
          seq(
            $.keyword_wait,
            field('timeout', alias($._natural_number, $.literal))
          )
        )
      ),
      $.keyword_to,
      $.object_reference,
      repeat(
        seq(
          ',',
          $._rename_table_names,
        )
      ),
    ),

    _rename_table_names: $ => seq(
      $.object_reference,
      $.keyword_to,
      $.object_reference,
    ),

    alter_table: $ => seq(
      optional($.keyword_nontemporal),
      $.keyword_alter,
      $.keyword_table,
      optional($._if_exists),
      $.object_reference,
      choice(
        seq(
          $._alter_specifications,
          repeat(
            seq(
              ",",
              $._alter_specifications
            )
          )
        ),
      ),
    ),

    _alter_specifications: $ => choice(
      $.add_column,
      $.add_constraint,
      $.drop_constraint,
      $.alter_column,
      $.modify_column,
      $.change_column,
      $.drop_column,
      $.rename_object,
      $.rename_column,
      $.change_ownership,
    ),

    // TODO: optional `keyword_add` is necessary to allow for chained alter statements in t-sql
    // maybe needs refactoring
    add_column: $ => seq(
      optional($.keyword_add),
      optional(
        $.keyword_column,
      ),
      optional($._if_not_exists),
      $.column_definition,
    ),

    add_constraint: $ => seq(
      $.keyword_add,
      optional($.keyword_constraint),
      $.identifier,
      $.constraint,
    ),

    drop_constraint: $ => seq(
      $.keyword_drop,
      $.keyword_constraint,
      optional($._if_exists),
      $.identifier,
      optional($._drop_behavior),
    ),

    alter_column: $ => seq(
      // TODO constraint management
      $.keyword_alter,
      optional(
        $.keyword_column,
      ),
      field('name', $.identifier),
      choice(
        seq(
          choice(
            $.keyword_set,
            $.keyword_drop,
          ),
          $.keyword_not,
          $.keyword_null,
        ),
        seq(
          optional(
            seq(
              $.keyword_set,
              $.keyword_data,
            ),
          ),
          $.keyword_type,
          field('type', $._type),
        ),
        seq(
          $.keyword_set,
          choice(
            seq(
              $.keyword_statistics,
              field('statistics', $._integer)
            ),
            seq(
              $.keyword_storage,
              choice(
                $.keyword_plain,
                $.keyword_external,
                $.keyword_extended,
                $.keyword_main,
                $.keyword_default,
              ),
            ),
            seq(
              $.keyword_compression,
              field('compression_method', $._identifier)
            ),
            seq(
              paren_list($._key_value_pair, true),
            ),
            seq(
              $.keyword_default,
              $._expression,
            ),
          )
        ),
        seq(
          $.keyword_drop,
          $.keyword_default,
        ),
      ),
    ),

    modify_column: $ => seq(
      $.keyword_modify,
      optional(
        $.keyword_column,
      ),
      optional($._if_exists),
      $.column_definition,
    ),

    change_column: $ => seq(
      $.keyword_change,
      optional(
        $.keyword_column,
      ),
      optional($._if_exists),
      field('old_name', $.identifier),
      $.column_definition,
    ),

    drop_column: $ => seq(
      $.keyword_drop,
      optional(
        $.keyword_column,
      ),
      optional($._if_exists),
      field('name', $.identifier),
    ),

    rename_column: $ => seq(
      $.keyword_rename,
      optional(
        $.keyword_column,
      ),
      field('old_name', $.identifier),
      $.keyword_to,
      field('new_name', $.identifier),
    ),

    alter_view: $ => seq(
      $.keyword_alter,
      $.keyword_view,
      optional($._if_exists),
      $.object_reference,
      choice(
        // TODO Postgres allows a single "alter column" to set or drop default
        $.rename_object,
        $.rename_column,
        $.change_ownership,
      ),
    ),

    alter_database: $ => seq(
      $.keyword_alter,
      $.keyword_database,
      $.identifier,
      optional($.keyword_with),
      choice(
        seq($.rename_object),
        seq($.change_ownership),
        seq(
          $.keyword_reset,
          choice(
            $.keyword_all,
            field("configuration_parameter", $.identifier)
          ),
        ),
        seq(
          $.keyword_set,
          choice(
            seq($.keyword_tablespace, $.identifier),
              $.set_configuration,
            ),
          ),
        ),
      ),

    alter_role: $ => seq(
      $.keyword_alter,
      choice(
        $.keyword_role,
        $.keyword_group,
        $.keyword_user,
      ),
      choice($.identifier, $.keyword_all),
      choice(
        $.rename_object,
        seq(optional($.keyword_with),repeat($._role_options)),
        seq(
          optional(seq($.keyword_in, $.keyword_database, $.identifier)),
          choice(
            seq(
              $.keyword_set,
              $.set_configuration,
            ),
            seq(
              $.keyword_reset,
              choice(
                $.keyword_all,
                field("option", $.identifier),
              )),
          ),
        )
      ),
    ),

    set_configuration: $ => seq(
      field("option", $.identifier),
      choice(
        seq($.keyword_from, $.keyword_current),
        seq(
          choice($.keyword_to, "="),
          choice(
            field("parameter", $.identifier),
            $.literal,
            $.keyword_default
          )
        )
      ),
    ),

    alter_index: $ => seq(
      $.keyword_alter,
      $.keyword_index,
      optional($._if_exists),
      $.identifier,
      choice(
        $.rename_object,
        seq(
          $.keyword_alter,
          optional($.keyword_column),
          alias($._natural_number, $.literal),
          $.keyword_set,
          $.keyword_statistics,
          alias($._natural_number, $.literal),
        ),
        seq($.keyword_reset, paren_list($.identifier)),
        seq(
          $.keyword_set,
          choice(
            seq($.keyword_tablespace, $.identifier),
            paren_list(seq($.identifier, '=', field("value", $.literal)))
          ),
        ),
      ),
    ),

    alter_sequence: $ => seq(
      $.keyword_alter,
      $.keyword_sequence,
      optional($._if_exists),
      $.object_reference,
      choice(
        repeat1(
          choice(
            seq($.keyword_as, $._type),
            seq($.keyword_increment, optional($.keyword_by), $.literal),
            seq($.keyword_minvalue, choice($.literal, seq($.keyword_no, $.keyword_minvalue))),
            seq($.keyword_maxvalue, choice($.literal, seq($.keyword_no, $.keyword_maxvalue))),
            seq($.keyword_start, optional($.keyword_with), field("start", alias($._integer, $.literal))),
            seq($.keyword_restart, optional($.keyword_with), field("restart", alias($._integer, $.literal))),
            seq($.keyword_cache, field("cache", alias($._integer, $.literal))),
            seq(optional($.keyword_no), $.keyword_cycle),
            seq($.keyword_owned, $.keyword_by, choice($.keyword_none, $.object_reference)),
          ),
        ),
        $.rename_object,
        $.change_ownership,
        seq(
          $.keyword_set,
            choice($.keyword_logged, $.keyword_unlogged),
        ),
      ),
    ),

    alter_type: $ => seq(
      $.keyword_alter,
      $.keyword_type,
      $.identifier,
      choice(
        $.change_ownership,
        $.rename_object,
        seq(
          $.keyword_rename,
          $.keyword_attribute,
          $.identifier,
          $.keyword_to,
          $.identifier,
          optional($._drop_behavior)
        ),
        seq(
          $.keyword_add,
          $.keyword_value,
          optional($._if_not_exists),
            alias($._single_quote_string,$.literal),
          optional(
            seq(
              choice($.keyword_before, $.keyword_after),
              alias($._single_quote_string,$.literal),
            )
          ),
        ),
        seq(
          $.keyword_rename,
          $.keyword_value,
          alias($._single_quote_string,$.literal),
          $.keyword_to,
          alias($._single_quote_string,$.literal),
        ),
        seq(
          choice(
            seq(
              $.keyword_add,
              $.keyword_attribute,
              $.identifier,
              $._type
            ),
            seq($.keyword_drop,
              $.keyword_attribute,
              optional($._if_exists),
              $.identifier),
            seq(
              $.keyword_alter,
              $.keyword_attribute,
              $.identifier,
              optional(seq($.keyword_set, $.keyword_data)),
              $.keyword_type,
              $._type
            ),
          ),
          optional(seq($.keyword_collate, $.identifier)),
          optional($._drop_behavior)
        )
      ),
    ),

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
        $.drop_extension,
        $.drop_function,
        $.drop_stats,
        $.drop_join_index,
      ),
    ),

    drop_join_index: $ => seq(
      $.keyword_drop,
      $.keyword_join,
      $.keyword_index,
      $.object_reference,
    ),

    drop_stats: $ => seq(
      $.keyword_drop,
      $._stats,
      $.keyword_on,
      $.object_reference,
    ),

    drop_table: $ => seq(
      $.keyword_drop,
      $.keyword_table,
      optional($._if_exists),
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_view: $ => seq(
      $.keyword_drop,
      $.keyword_view,
      optional($._if_exists),
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_database: $ => seq(
      $.keyword_drop,
      $.keyword_database,
      optional($._if_exists),
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
      optional($._if_exists),
      $.identifier,
    ),

    drop_type: $ => seq(
      $.keyword_drop,
      $.keyword_type,
      optional($._if_exists),
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_sequence: $ => seq(
      $.keyword_drop,
      $.keyword_sequence,
      optional($._if_exists),
      $.object_reference,
      optional($._drop_behavior),
    ),

    drop_index: $ => seq(
      $.keyword_drop,
      $.keyword_index,
      optional($.keyword_concurrently),
      optional($._if_exists),
      field("name", $.identifier),
      optional($._drop_behavior),
      optional(
        seq(
            $.keyword_on,
            $.object_reference,
        ),
      ),
    ),

    drop_extension: $ => seq(
      $.keyword_drop,
      $.keyword_extension,
      optional($._if_exists),
      comma_list($.identifier, true),
      optional(choice($.keyword_cascade, $.keyword_restrict)),
    ),

    drop_function: $ => seq(
      $.keyword_drop,
      $.keyword_function,
      optional($._if_exists),
      $.object_reference,
      optional($._drop_behavior),
    ),

    rename_object: $ => seq(
      $.keyword_rename,
      $.keyword_to,
      $.object_reference,
    ),

    change_ownership: $ => seq(
      $.keyword_owner,
      $.keyword_to,
      $.identifier,
    ),

    object_id: $ => seq(
      $.keyword_object_id,
      wrapped_in_parenthesis(
        seq(
          alias($._literal_string, $.literal),
          optional(
            seq(
              ',',
              alias($._literal_string, $.literal),
            ),
          ),
        ),
      ),
    ),

    object_reference: $ => choice(
      seq(
        field('database', $.identifier),
        '.',
        field('schema', $.identifier),
        '.',
        field('name', $.identifier),
      ),
      seq(
        field('schema', $.identifier),
        '.',
        field('name', $.identifier),
      ),
      field('name', $.identifier),
    ),

    _copy_statement: $ => seq(
      $.keyword_copy,
      $.object_reference,
      $._column_list,
      $.keyword_from,
      choice(
        $.keyword_stdin,
        alias($._literal_string, "filename"),
        seq($.keyword_program, alias($._literal_string, "command")),
      ),
      optional($.keyword_with),
      wrapped_in_parenthesis(
        repeat1(
          choice(
            seq(
              $.keyword_format,
              choice(
                $.keyword_csv,
                $.keyword_binary,
                $.keyword_text,
              ),
            ),
            seq(
              $.keyword_freeze,
              choice(
                $.keyword_true,
                $.keyword_false
              )
            ),
            seq(
              $.keyword_header,
              choice(
                $.keyword_true,
                $.keyword_false,
                $.keyword_match
              ),
            ),
            seq(
              choice(
                $.keyword_delimiter,
                $.keyword_null,
                $.keyword_default,
                $.keyword_escape,
                $.keyword_quote,
                $.keyword_encoding,
              ),
              alias($._literal_string, $.identifier)
            ),
            seq(
              choice(
                $.keyword_force_null,
                $.keyword_force_not_null,
                $.keyword_force_quote,
              ),
              $._column_list
            ),
          ),
        ),
      ),
      optional($.where),
    ),

    _insert_statement: $ => seq(
      optional($.keyword_nontemporal),
      $.insert,
    ),

    insert: $ => seq(
      choice(
        $._insert,
        $.keyword_replace
      ),
      optional(
        choice(
          $.keyword_low_priority,
          $.keyword_delayed,
          $.keyword_high_priority,
        ),
      ),
      optional($.keyword_ignore),
      optional(
        choice(
          $.keyword_into,
          $.keyword_overwrite, // Spark SQL
        ),
      ),
      $.object_reference,
      optional($.table_partition), // Spark SQL
      optional(
        seq(
          $.keyword_as,
          field('alias', $.identifier)
        ),
      ),
      // TODO we need a test for `insert...set`
      choice(
        $._insert_values,
        $._set_values,
      ),
      optional(
        choice(
          $._on_conflict,
          $._on_duplicate_key_update,
        ),
      ),
    ),

    _on_conflict: $ => seq(
      $.keyword_on,
      $.keyword_conflict,
      seq(
        $.keyword_do,
        choice(
          $.keyword_nothing,
          seq(
            $._update,
            $._set_values,
            optional($.where),
          ),
        ),
      ),
    ),

    _on_duplicate_key_update: $ => seq(
      $.keyword_on,
      $.keyword_duplicate,
      $.keyword_key,
      $._update,
      $.assignment_list,
    ),

    assignment_list: $ => seq(
      $.assignment,
      repeat(seq(',', $.assignment)),
    ),

    _insert_values: $ => seq(
      optional(alias($._column_list, $.list)),
      choice(
        seq(
          $.keyword_values,
          comma_list($.list, true),
        ),
        $._dml_read,
      ),
    ),

    _set_values: $ => seq(
      $.keyword_set,
      comma_list($.assignment, true),
    ),

    _column_list: $ => paren_list(alias($._column, $.column), true),
    _column: $ => choice(
      $.identifier,
      alias($._literal_string, $.literal),
    ),

    _update_statement: $ => seq(
      optional($.keyword_nontemporal),
      $.update,
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

    _merge_statement: $=> seq(
      optional($.lock_clause),
      $.keyword_merge,
      $.keyword_into,
      $.object_reference,
      optional($._alias),
      $.keyword_using,
      choice(
        $.subquery,
        $.object_reference
      ),
      optional($._alias),
      $.keyword_on,
      optional_parenthesis(field("predicate", $._expression)),
      repeat1($.when_clause)
    ),

    when_clause: $ => seq(
      $.keyword_when,
      optional($.keyword_not),
      $.keyword_matched,
      optional(
        seq(
          $.keyword_and,
          optional_parenthesis(field("predicate", $._expression))
        )
      ),
      $.keyword_then,
      choice(
        $._delete,
        seq(
          $._update,
          $._set_values,
        ),
        seq(
          $._insert,
          $._insert_values
        ),
        optional($.where)
      )
    ),


    // TODO: this does not account for partitions specs like
    // (partcol1='2022-01-01', hr=11)
    // the second argument is not a $.table_option
    _partition_spec: $ => seq(
      $.keyword_partition,
      paren_list($.table_option, true),
    ),

    update: $ => seq(
      $._update,
      choice(
        $._mysql_update_statement,
        $._postgres_update_statement,
        $._teradata_update_statement,
      ),
    ),

    _teradata_update_statement: $ => prec(0,
      seq(
        $.object_reference,
        $.keyword_from,
        comma_list($.relation, true),
        repeat($.join),
        $._set_values,
        optional($.where),
      ),
      ),

    _mysql_update_statement: $ => prec(1,
      seq(
        comma_list($.relation, true),
        repeat($.join),
        $._set_values,
        optional($.where),
      ),
    ),

    _postgres_update_statement: $ => prec(2,
      seq(
        $.relation,
        $._set_values,
        optional($.from),
      ),
    ),

    macro: $ => seq(
      $._exec,
      field('macro', $.object_reference),
      optional(wrapped_in_parenthesis(
          comma_list($._expression),
        ),
      ),
    ),

    procedure: $ => seq(
      $.keyword_call,
      field('procedure', $.object_reference),
      optional(wrapped_in_parenthesis(
          comma_list($._expression),
        ),
      ),
    ),

    abort: $ => seq(
      $.keyword_abort,
      field('abort_message', alias($._literal_string, $.literal)),
      optional(choice($.where, $.from)),
    ),

    storage_location: $ => prec.right(
        seq(
            $.keyword_location,
            field('path', alias($._literal_string, $.literal)),
            optional(
                seq(
                    $.keyword_cached,
                    $.keyword_in,
                    field('pool', alias($._literal_string, $.literal)),
                    optional(
                        choice(
                            $.keyword_uncached,
                            seq(
                                $.keyword_with,
                                $.keyword_replication,
                                '=',
                                field('value', alias($._natural_number, $.literal)),
                            ),
                        ),
                    ),
                )
            )
        ),
    ),

    row_format: $ => seq(
        $.keyword_row,
        $.keyword_format,
        $.keyword_delimited,
        optional(
            seq(
                $.keyword_fields,
                $.keyword_terminated,
                $.keyword_by,
                field('fields_terminated_char', alias($._literal_string, $.literal)),
                optional(
                    seq(
                        $.keyword_escaped,
                        $.keyword_by,
                        field('escaped_char', alias($._literal_string, $.literal)),
                    )
                )
            )
        ),
        optional(
            seq(
                $.keyword_lines,
                $.keyword_terminated,
                $.keyword_by,
                field('row_terminated_char', alias($._literal_string, $.literal)),
            )
        )
    ),

    table_sort: $ => seq(
        $.keyword_sort,
        $.keyword_by,
        paren_list($.identifier, true),
    ),

    table_partition: $ => seq(
      choice(
        // Postgres/MySQL style
        seq(
          $.keyword_partition,
          $.keyword_by,
          choice(
            $.keyword_range,
            $.keyword_hash,
          )
        ),
        // Hive style
        seq(
          $.keyword_partitioned,
          $.keyword_by,
        ),
        // Spark SQL
        $.keyword_partition,
      ),
      choice(
        paren_list($.identifier),// postgres & Impala (CTAS)
        $.column_definitions, // impala/hive external tables
        paren_list($._key_value_pair, true), // Spark SQL
      )
    ),

    _key_value_pair: $ => seq(
      field('key',$.identifier),
      '=',
      field('value', alias($._literal_string, $.literal)),
    ),

    assignment: $ => seq(
      field('left',
        alias(
          $._qualified_field,
          $.field,
        ),
      ),
      '=',
      field('right', $._expression),
    ),

    table_option: $ => choice(
      seq($.keyword_default, $.keyword_character, $.keyword_set, $.identifier),
      seq($.keyword_collate, $.identifier),
      field('name', $.keyword_default),
      seq(
        field('name', choice($.keyword_engine, $.identifier, $._literal_string)),
        '=',
        field('value', choice($.identifier, $._literal_string)),
      ),
    ),

      primary_index_clause:$ => seq(
        optional($.keyword_unique),
        $.keyword_primary,
        $.keyword_index,
        optional($.object_reference),
        '(',
          seq(
            field('value', $._expression),
            repeat(seq(',', field('value', $._expression)))
          ),
        ')',
      ),

      partition_by_clause: $ => seq(
        $.keyword_partition,
        $.keyword_by,
        '(',
        seq(
          field('partition_expression', $._expression),
          repeat(seq(
            ',',
            field('partition_expression', $._expression)
          ))
        ),
        ')'
      ),

    column_definitions: $ => seq(
      '(',
      comma_list($.column_definition, true),
      optional($.constraints),
      ')',
    ),

    column_definition: $ => seq(
      choice($._derived_period,
        field('name', $._column)),
      field('type', $._type),
      repeat($._column_constraint),
    ),

    _format_column_constraint: $ => seq($.keyword_format, $._literal_string),
    _compress_column_constraint: $ =>
        seq($.keyword_compress,
            optional(wrapped_in_parenthesis(comma_list(alias($._literal_string, $.literal), true)))
      ),

    _character_set_column_constraint: $ => seq($.keyword_character, $.keyword_set, $.object_reference),

    _title_column_constraint: $ => seq($.keyword_title, $.literal),

    _derived_period: $ => seq($.keyword_period, $.keyword_for,
          field('name', seq($._column, '(', $._column, ',', $._column, ')')),
          ),

    _column_comment: $ => seq(
      $.keyword_comment,
      alias($._literal_string, $.literal)
    ),

    _column_constraint: $ => prec.left(choice(
      choice(
        $.keyword_null,
        $._not_null,
      ),
      seq(
        $.keyword_references,
        $.object_reference,
        paren_list($.identifier, true),
        repeat(
          seq(
            $.keyword_on,
            choice($._delete, $._update),
            choice(
              seq($.keyword_no, $.keyword_action),
              $.keyword_restrict,
              $.keyword_cascade,
              seq(
                $.keyword_set,
                choice($.keyword_null, $.keyword_default),
                  optional(paren_list($.identifier, true))
              ),
            ),
          ),
        ),
      ),
      $._title_column_constraint,
      $._format_column_constraint,
      $._compress_column_constraint,
      $._character_set_column_constraint,
      seq(optional($.keyword_not), $.keyword_casespecific),
      $._default_expression,
      $._primary_key,
      $.keyword_auto_increment,
      $.direction,
      $._column_comment,
      $._check_constraint,
      seq(
        optional(seq($.keyword_generated, $.keyword_always)),
        $.keyword_as,
        $._expression,
      ),
      choice(
        $.keyword_stored,
        $.keyword_virtual,
      ),
      $.keyword_unique
    )),

    _check_constraint: $ => seq(
      optional(
        seq(
          $.keyword_constraint,
          $.literal
        )
      ),
      $.keyword_check,
      wrapped_in_parenthesis($.binary_expression)
    ),

    _default_expression: $ => seq(
      $.keyword_default,
      optional_parenthesis($._inner_default_expression),
    ),
    _inner_default_expression: $ => choice(
        $.literal,
        $.list,
        $.cast,
        $.binary_expression,
        $.unary_expression,
        $.array,
        $.invocation,
        $.keyword_user,
        seq($.keyword_current_timestamp, optional(wrapped_in_parenthesis($._integer))),
        alias($.implicit_cast, $.cast),
    ),

    constraints: $ => seq(
      ',',
      $.constraint,
      repeat(
        seq(',', $.constraint),
      ),
    ),

    constraint: $ => choice(
      $._constraint_literal,
      $._key_constraint,
      $._primary_key_constraint,
      $._check_constraint
    ),

    _constraint_literal: $ => seq(
      $.keyword_constraint,
      field('name', $.identifier),
      choice(
        seq(
          $._primary_key,
          $.ordered_columns,
        ),
        seq(
          $._check_constraint
        )
      )
    ),

    _primary_key_constraint: $ => seq(
      $._primary_key,
      $.ordered_columns,
    ),

    _key_constraint: $ => seq(
      choice(
        seq(
          $.keyword_unique,
          optional(
            choice(
              $.keyword_index,
              $.keyword_key,
              seq($.keyword_nulls, optional($.keyword_not), $.keyword_distinct),
            ),
          ),
        ),
        seq(optional($.keyword_foreign), $.keyword_key, optional($._if_not_exists)),
        $.keyword_index,
      ),
      optional(field('name', $.identifier)),
      $.ordered_columns,
      optional(
        seq(
          $.keyword_references,
          $.object_reference,
          paren_list($.identifier, true),
          repeat(
            seq(
              $.keyword_on,
              choice($._delete, $._update),
              choice(
                seq($.keyword_no, $.keyword_action),
                $.keyword_restrict,
                $.keyword_cascade,
                seq(
                  $.keyword_set,
                  choice($.keyword_null, $.keyword_default),
                    optional(paren_list($.identifier, true))
                ),
              ),
            ),
          ),
        ),
      ),
    ),

    ordered_columns: $ => paren_list(alias($.ordered_column, $.column), true),

    ordered_column: $ => seq(
      field('name', $._column),
      optional($.direction),
    ),

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

    implicit_cast: $ =>  seq(
      $._expression,
      wrapped_in_parenthesis($._type)
    ),

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

    invocation: $ => prec(1,
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
        optional(
          seq(
            $.keyword_with,
            $.keyword_ordinality,
            optional(
              seq(
                $.keyword_as,
                field("alias", $.identifier),
                paren_list($.identifier),
              )
            )
          )
        )
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

    _expression_base: $ => prec(1, choice(
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
          $.array,
          $.interval,
          $.between_expression,
          $.parenthesized_expression,
          $.object_id,
          $.interval_expression,
          $.attribute_expression,
          $.period_expression,
        ),
      ),

    _expression: $ =>
      choice(seq(
          choice(
            prec(2, seq(
              $._expression_base,
              $.keyword_escape,
              $._literal_string
            )),
            prec(1, $._expression_base)
          ),
          $._temporal_qualifier),
      choice(
        prec(2, seq(
          $._expression_base,
          $.keyword_escape,
          $._literal_string
        )),
        prec(1, $._expression_base)
      ),
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
        ['=', 'binary_relation'],
        ['<', 'binary_relation'],
        ['<=', 'binary_relation'],
        ['!=', 'binary_relation'],
        ['>=', 'binary_relation'],
        ['>', 'binary_relation'],
        ['<>', 'binary_relation'],
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
        $._dollar_quoted_string,
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

    identifier: $ => choice(
      $._identifier,
      $._double_quote_string,
      $._tsql_parameter,
      seq("`", $._identifier, "`"),
      $._interpolated_identifier,
      $._interpolated_identifier1,
      $._interpolated_identifier2,
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

  }

});

function unsigned_type($, type) {
  return choice(
    seq($.keyword_unsigned, type),
    seq(
      type,
      optional($.keyword_unsigned),
      optional($.keyword_zerofill),
    ),
  )
}

function optional_parenthesis(node) {
  return prec.right(
    choice(
      node,
      wrapped_in_parenthesis(node),
    ),
  )
}

function wrapped_in_parenthesis(node) {
  if (node) {
    return seq("(", node, ")");
  }
  return seq("(", ")");
}

function parametric_type($, type, params = ['size']) {
  return prec.right(1,
    choice(
      type,
      seq(
        type,
        wrapped_in_parenthesis(
          seq(
            // first parameter is guaranteed, shift it out of the array
            field(params.shift(), alias($._natural_number, $.literal)),
            // then, fill in the ", next" until done
            ...params.map(p => seq(',', field(p, alias($._natural_number, $.literal)))),
          ),
        ),
      ),
    ),
  )
}

function comma_list(field, requireFirst) {
  sequence = seq(field, repeat(seq(',', field)));

  if (requireFirst) {
    return sequence;
  }

  return optional(sequence);
}

function paren_list(field, requireFirst) {
  return wrapped_in_parenthesis(
    comma_list(field, requireFirst),
  )
}

function make_keyword(word) {
  str = "";
  for (var i = 0; i < word.length; i++) {
    str = str + "[" + word.charAt(i).toLowerCase() + word.charAt(i).toUpperCase() + "]";
  }
  return new RegExp(str);
}
