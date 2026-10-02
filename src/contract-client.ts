import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ContractCallResponse, ContractInvokeResponse } from './types';

export interface ContractClientOptions {
  /**
   * Timeout for HTTP requests in milliseconds.
   * Defaults to 0 (no timeout) if not specified.
   */
  timeout?: number;
}

export class ContractClient {
  private axiosInstance: AxiosInstance;

  constructor(options: ContractClientOptions = {}) {
    this.axiosInstance = axios.create({
      timeout: options.timeout || 0,
    });
  }

  async call(address: string, functionName: string, args: any[]): Promise<ContractCallResponse> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `/contracts/${address}/call`,
      data: {
        function: functionName,
        args: args,
      },
    };

    const response = await this.axiosInstance.request(config);
    return response.data;
  }

  async invoke(address: string, functionName: string, args: any[]): Promise<ContractInvokeResponse> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `/contracts/${address}/invoke`,
      data: {
        function: functionName,
        args: args,
      },
    };

    const response = await this.axiosInstance.request(config);
    return response.data;
  }
}
