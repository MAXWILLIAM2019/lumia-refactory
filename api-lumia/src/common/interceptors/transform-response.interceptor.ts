import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor para transformar respostas da API
 * 
 * VERSÃO SIMPLIFICADA PARA TESTES COM POSTMAN
 * Esta versão não faz transformações nos objetos, apenas passa os dados como estão
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Durante os testes com Postman, vamos apenas passar os dados sem transformações
    return next.handle();
    
    // Código original comentado para referência futura
    /*
    return next.handle().pipe(
      map(data => this.transformResponse(data))
    );
    */
  }

  // Métodos de transformação comentados para referência futura
  /*
  private transformResponse(data: any): any {
    if (!data) return data;

    // Se for um array, transforma cada item
    if (Array.isArray(data)) {
      return data.map(item => this.transformObject(item));
    }

    // Se for um objeto, transforma
    if (typeof data === 'object') {
      return this.transformObject(data);
    }

    return data;
  }

  private transformObject(obj: any): any {
    // Versão simplificada - retorna o objeto sem transformações
    return obj;
  }
  */
}
