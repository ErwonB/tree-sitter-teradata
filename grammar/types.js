const { make_keyword, parametric_type } = require('./helpers.js');

module.exports = {

  _castable_type: $ => choice(
      $.keyword_boolean,
      $.bit,
      $.binary,
      $.varbinary,

      $.byteint,
      $.bigint,
      $.smallint,
      $.int,
      $.decimal,
      $.numeric,
      $.double,
      $.float,

      $.char,
      $.varchar,
      $.nchar,
      $.nvarchar,
      $.numeric,
      $.keyword_text,

      $.keyword_json,
      $.keyword_xml,

      $.keyword_date,
      seq(optional($.keyword_as), $.keyword_transactiontime),
      $.time,
      $.timestamp,
      $.keyword_interval,

      $.keyword_st_geometry,
      $.keyword_mbr,
      $.keyword_mbb,

      $.format,

    ),

  _type: $ => prec.left(
    choice(
      $._castable_type,
      field("custom_type", $.object_reference)
    ),
  ),

  smallint: $ => $.keyword_smallint,
  int: $ => $.keyword_int,
  bigint: $ => $.keyword_bigint,
  byteint: $ => $.keyword_byteint,

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
    parametric_type($, $.keyword_float, ['precision', 'scale']),
  ),

  double: $ => choice(
    make_keyword("float8"),
    parametric_type($, $.keyword_double, ['precision', 'scale']),
    parametric_type($, seq($.keyword_double, $.keyword_precision), ['precision', 'scale']),
    parametric_type($, $.keyword_real, ['precision', 'scale']),
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
  time: $ => seq(
    parametric_type($, $.keyword_time),
    optional($._include_time_zone),
  ),
  timestamp: $ => seq(
    parametric_type($, $.keyword_timestamp),
    optional($._include_time_zone),
  ),

};
