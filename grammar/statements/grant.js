const { comma_list } = require('../helpers.js');

module.exports = {

  _grant_statement: $ => choice(
    $.grant,
    $.revoke,
    $.grant_logon,
    $.revoke_logon,
  ),

  // GRANT privilege[,...] [ON object] TO grantee[,...]
  //       [WITH {GRANT|ADMIN} OPTION]
  // The role form (GRANT role TO user) is covered by the identifier
  // branch of $.privilege plus WITH ADMIN OPTION.
  grant: $ => seq(
    $.keyword_grant,
    comma_list($.privilege, true),
    optional($.grant_on_clause),
    $.keyword_to,
    $._grantee_list,
    optional($.grant_option),
  ),

  // REVOKE [GRANT OPTION FOR] privilege[,...] [ON object] {TO|FROM} grantee[,...]
  revoke: $ => seq(
    $.keyword_revoke,
    optional(seq($.keyword_grant, $.keyword_option, $.keyword_for)),
    comma_list($.privilege, true),
    optional($.grant_on_clause),
    choice($.keyword_to, $.keyword_from),
    $._grantee_list,
  ),

  privilege: $ => choice(
    // ALL [PRIVILEGES]
    seq($.keyword_all, optional($.keyword_privileges)),
    // {ALTER|CREATE|DROP} [EXTERNAL|OWNER] object_kind
    seq(
      choice($.keyword_alter, $.keyword_create, $.keyword_drop),
      optional(choice($.keyword_external, $.keyword_owner)),
      $._privilege_object_kind,
    ),
    // EXECUTE [FUNCTION | PROCEDURE]
    seq(
      $.keyword_execute,
      optional(choice($.keyword_function, $.keyword_procedure)),
    ),
    // GLOP [MEMBER]
    seq($.keyword_glop, optional($.keyword_member)),
    // OVERRIDE ... constraint privileges keep their trailing words as
    // identifiers (OVERRIDE SELECT CONSTRAINT, etc.)
    seq($.keyword_override, repeat1(field('privilege', $.identifier))),
    // single-word DML and utility privileges
    $.keyword_select,
    $.keyword_insert,
    $.keyword_update,
    $.keyword_delete,
    $.keyword_references,
    $.keyword_index,
    $.keyword_show,
    $.keyword_database,
    $.keyword_statistics,
    $.keyword_stats,
    $.keyword_nontemporal,
    // long tail: ABORTSESSION, MONRESOURCE, MONSESSION, SETRESRATE,
    // SETSESSRATE, CTCONTROL, REPLCONTROL, DUMP, RESTORE, UDTMETHOD,
    // UDTTYPE, UDTUSAGE, ... and role names in the role form.
    field('privilege', $.identifier),
  ),

  _privilege_object_kind: $ => choice(
    $.keyword_table,
    $.keyword_view,
    $.keyword_macro,
    $.keyword_procedure,
    $.keyword_function,
    $.keyword_database,
    $.keyword_user,
    $.keyword_role,
    $.keyword_profile,
    $.keyword_trigger,
    $.keyword_index,
    $.keyword_authorization,
    $.keyword_glop,
    $.keyword_sequence,
    $.keyword_type,
    $.keyword_zone,
  ),

  grant_on_clause: $ => seq(
    $.keyword_on,
    optional(choice(
      seq($.keyword_specific, $.keyword_function),
      $.keyword_procedure,
      $.keyword_function,
      $.keyword_macro,
      $.keyword_table,
      $.keyword_view,
      $.keyword_database,
      $.keyword_user,
      $.keyword_type,
      $.keyword_glop,
      $.keyword_zone,
    )),
    field('target', $.object_reference),
  ),

  _grantee_list: $ => seq(
    optional($.keyword_all),
    comma_list($.grantee, true),
  ),

  grantee: $ => choice(
    $.keyword_public,
    $.object_reference,
  ),

  grant_option: $ => seq(
    $.keyword_with,
    choice($.keyword_grant, $.keyword_admin),
    $.keyword_option,
  ),

  // GRANT LOGON ON {host_id|ALL}[,...] {AS DEFAULT | TO user[,...]}
  //       [WITH NULL PASSWORD]
  grant_logon: $ => seq(
    $.keyword_grant,
    $.keyword_logon,
    $._logon_hosts,
    choice(
      seq($.keyword_as, $.keyword_default),
      seq($.keyword_to, comma_list($.grantee, true)),
    ),
    optional(seq($.keyword_with, $.keyword_null, $.keyword_password)),
  ),

  revoke_logon: $ => seq(
    $.keyword_revoke,
    $.keyword_logon,
    $._logon_hosts,
    choice(
      seq($.keyword_as, $.keyword_default),
      seq(choice($.keyword_from, $.keyword_to), comma_list($.grantee, true)),
    ),
  ),

  _logon_hosts: $ => seq(
    $.keyword_on,
    comma_list(
      choice($.keyword_all, field('host_id', alias($._integer, $.literal))),
      true,
    ),
  ),

};
