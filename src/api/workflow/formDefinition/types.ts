export interface FormDefinitionVO {
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

}

export interface FormDefinitionForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 动态表单id
   */
  formId?: string | number;

  /**
   * 流程定义id
   */
  processDefinitionKey?: string;

  /**
   * 流程定义名称
   */
  processDefinitionName?: string;

  /**
   * 流程定义id
   */
  processDefinitionId?: string | number;

  /**
   * 流程定义版本
   */
  processDefinitionVersion?: number;

}

export interface FormDefinitionQuery extends PageQuery {

  /**
   * 动态表单id
   */
  formId?: string | number;

  /**
   * 流程定义id
   */
  processDefinitionKey?: string;

  /**
   * 流程定义名称
   */
  processDefinitionName?: string;

  /**
   * 流程定义id
   */
  processDefinitionId?: string | number;

  /**
   * 流程定义版本
   */
  processDefinitionVersion?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



