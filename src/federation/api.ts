/* tslint:disable-next-line:no-namespace */
export namespace Api {
    export interface Record {
      account_id: string;
      memo_type?: string;
      memo?: string;
    }

    export interface Options {
      allowHttp?: boolean;
      timeout?: number;
    }
  }
