import { ADMIN_PASSWORD_PATTERN, ADMIN_USERNAME_PATTERN } from './constants';

/** 管理员表单的校验上下文，决定哪些字段在本次提交中必填。 */
export interface AdminFormRuleContext {
  /** 是否为编辑态，编辑态允许留空密码表示不修改。 */
  isEdit: boolean;
  /** 本次提交是否需要复核当前登录管理员密码。 */
  needCurrentPassword: boolean;
  /** 读取表单中的新密码，用于确认密码一致性校验。 */
  getPassword: () => string;
}

/** 生成确认密码校验规则，与新密码不一致时拒绝提交。 */
function createConfirmPasswordRule(getPassword: () => string): App.Global.FormRule[] {
  return [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule, value: string) => !value || value === getPassword(),
      message: '两次输入的密码不一致',
      trigger: ['input', 'blur']
    }
  ];
}

/** 生成管理员新增和编辑表单的校验规则，与后端用户名和密码约束保持一致。 */
export function createAdminFormRules(context: AdminFormRuleContext): Record<string, App.Global.FormRule[]> {
  const passwordRules: App.Global.FormRule[] = [
    {
      required: !context.isEdit,
      message: '请输入密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule, value: string) => !value || ADMIN_PASSWORD_PATTERN.test(value),
      message: '密码需为 8-72 位且同时包含字母和数字',
      trigger: ['input', 'blur']
    }
  ];

  const rules: Record<string, App.Global.FormRule[]> = {
    username: [
      { required: true, message: '请输入用户名', trigger: ['input', 'blur'] },
      {
        pattern: ADMIN_USERNAME_PATTERN,
        message: '用户名需为 3-64 位字母、数字、点、下划线或连字符',
        trigger: ['input', 'blur']
      }
    ],
    password: passwordRules
  };

  if (!context.isEdit || context.getPassword()) {
    rules.confirmPassword = createConfirmPasswordRule(context.getPassword);
  }

  if (context.needCurrentPassword) {
    rules.currentPassword = [{ required: true, message: '请输入当前登录管理员密码', trigger: ['input', 'blur'] }];
  }

  return rules;
}

/** 生成管理员密码重置表单的校验规则。 */
export function createAdminPasswordFormRules(getPassword: () => string): Record<string, App.Global.FormRule[]> {
  return {
    password: [
      { required: true, message: '请输入新密码', trigger: ['input', 'blur'] },
      {
        pattern: ADMIN_PASSWORD_PATTERN,
        message: '密码需为 8-72 位且同时包含字母和数字',
        trigger: ['input', 'blur']
      }
    ],
    confirmPassword: createConfirmPasswordRule(getPassword),
    currentPassword: [{ required: true, message: '请输入当前登录管理员密码', trigger: ['input', 'blur'] }]
  };
}

/** 生成管理员删除确认表单的校验规则。 */
export function createAdminDeleteFormRules(): Record<string, App.Global.FormRule[]> {
  return {
    currentPassword: [{ required: true, message: '请输入当前登录管理员密码', trigger: ['input', 'blur'] }]
  };
}
