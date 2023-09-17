export interface FormVO extends BaseEntity {
  formId: number | string;
  formName: string;
  formConfig: string;
  content: string;
  status?: string;
  remark: string;
  wfFormDefinitionVo: {
      /**
       * 主键
       */
      id: string | number;

      /**
       * 动态表单id
       */
      formId: string | number;

      /**
       * 流程定义id
       */
      processDefinitionKey: string;

      /**
       * 流程定义名称
       */
      processDefinitionName: string;

      /**
       * 流程定义id
       */
      processDefinitionId: string | number;

      /**
       * 流程定义版本
       */
      processDefinitionVersion: number;
  };
}

export interface FormForm {
  formId: number | string | undefined;
  formName: string;
  formConfig?: string;
  content?: string;
  status?: string;
  remark: string;
}

export interface FormQuery extends PageQuery {
  formName?: string;
}
