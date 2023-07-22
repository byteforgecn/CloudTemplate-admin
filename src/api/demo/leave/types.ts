export interface LeaveVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 请假天数
   */
  leaveDays: number;

  /**
   * 备注
   */
  remark: string;

}

export interface LeaveForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

  /**
   * 备注
   */
  remark?: string;

}

export interface LeaveQuery extends PageQuery {
  /**
   * 标题
   */
  title?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

}
