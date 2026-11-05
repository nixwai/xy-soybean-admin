/** 菜单表单的校验上下文，用于实现权限编码和可见范围的联动约束。 */
export interface MenuFormRuleContext {
  /** 读取当前选中权限编码对应的权限记录。 */
  getPermission: () => ApiManagement.Permission | null;
  /** 读取当前表单的仅根管理员可见标识。 */
  getIsRootOnly: () => boolean;
}

/** 生成菜单表单校验规则，包含后端对受保护权限的联动约束。 */
export function createMenuFormRules(context: MenuFormRuleContext): Record<string, App.Global.FormRule[]> {
  return {
    title: [
      { required: true, message: '请输入菜单标题', trigger: ['input', 'blur'] },
      { max: 128, message: '菜单标题不能超过 128 个字符', trigger: ['input', 'blur'] }
    ],
    path: [
      { required: true, message: '请输入菜单路径', trigger: ['input', 'blur'] },
      { max: 255, message: '菜单路径不能超过 255 个字符', trigger: ['input', 'blur'] }
    ],
    order: [{ type: 'number', message: '排序值必须为数字', trigger: ['input', 'blur', 'change'] }],
    permissionCode: [
      {
        // 后端要求受保护权限只能配置为仅根管理员可见的菜单
        validator: () => {
          const permission = context.getPermission();
          return !permission?.isProtected || context.getIsRootOnly();
        },
        message: '受保护权限只能配置为仅根管理员可见的菜单',
        trigger: ['change', 'blur']
      }
    ]
  };
}
