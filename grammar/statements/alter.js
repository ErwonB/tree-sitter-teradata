const { paren_list, comma_list, optional_parenthesis, wrapped_in_parenthesis } = require('../helpers.js');

module.exports = {

    _alter_statement: $ => seq(
      choice(
        $.alter_table,
        $.alter_type,
        $.alter_role,
      ),
    ),

    alter_table: $ => seq(
      optional($.keyword_nontemporal),
      $.keyword_alter,
      $.keyword_table,
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
      $.column_definition,
    ),

    change_column: $ => seq(
      $.keyword_change,
      optional(
        $.keyword_column,
      ),
      field('old_name', $.identifier),
      $.column_definition,
    ),

    drop_column: $ => seq(
      $.keyword_drop,
      optional(
        $.keyword_column,
      ),
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

    alter_type: $ => seq(
      $.keyword_alter,
      $.keyword_type,
      field('name', $.object_reference),
      choice(
        // ADD <method_specification>
        seq($.keyword_add, $.method_specification),

        // DROP [INSTANCE | CONSTRUCTOR] METHOD name(params) [SPECIFIC name]
        seq(
          $.keyword_drop,
          optional(choice($.keyword_instance, $.keyword_constructor)),
          $.keyword_method,
          field('method_name', $.object_reference),
          wrapped_in_parenthesis(
            optional(comma_list($.parameter_specification, true))
          ),
          optional(seq($.keyword_specific, $.object_reference)),
        ),

        // ADD ATTRIBUTE <attribute_specification>
        seq($.keyword_add, $.keyword_attribute, $.attribute_specification),

        // DROP ATTRIBUTE attribute_name
        seq(
          $.keyword_drop,
          $.keyword_attribute,
          field('attribute_name', $.identifier),
        ),

        // COMPILE [ONLY] standalone
        seq($.keyword_compile, optional($.keyword_only)),
      ),
      // optional trailing COMPILE [ONLY]
      optional(seq($.keyword_compile, optional($.keyword_only))),
    ),

};
