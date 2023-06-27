export interface FormVO extends BaseEntity {
  formId: number | string;
  formName: string;
  formConfig: string;
  content: string;
  remark: string;
}

export interface FormForm {
  formId: number | string | undefined;
  formName: string;
  formConfig?: string;
  content?: string;
  remark: string;
}

export interface FormQuery extends PageQuery {
  formName?: string;
}
