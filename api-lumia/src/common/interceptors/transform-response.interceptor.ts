import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor para transformar respostas da API
 * Converte nomes de campos para compatibilidade com o frontend
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformResponse(data))
    );
  }

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
    if (!obj || typeof obj !== 'object') return obj;

    const transformed = { ...obj };

    // ===== TRANSFORMAÇÕES PARA USUARIO =====
    // Não precisamos mais converter IDs, pois usamos os nomes corretos no banco

    // Adicionar campos ausentes do sistema original
    if (!transformed.ultimo_acesso) {
      transformed.ultimo_acesso = null;
    }
    if (!transformed.data_senha_alterada) {
      transformed.data_senha_alterada = null;
    }
    if (!transformed.data_senha_expirada) {
      transformed.data_senha_expirada = null;
    }
    if (!transformed.login_secundario) {
      transformed.login_secundario = null;
    }

    // Remover campos que não existem no sistema original
    delete transformed.createdAt;
    delete transformed.updatedAt;

    // ===== TRANSFORMAÇÕES PARA GRUPO USUARIO =====
    if (transformed.grupo && transformed.grupo.id && !transformed.grupo.IdGrupo) {
      transformed.grupo = {
        ...transformed.grupo,
        IdGrupo: transformed.grupo.id
      };
    }

    // ===== TRANSFORMAÇÕES PARA ALUNO INFO =====
    if (transformed.alunoInfo) {
      const alunoInfo = { ...transformed.alunoInfo };
      
      // Manter apenas os campos que existem na entidade
      // Não precisamos mais converter IDs, pois usamos os nomes corretos no banco

      // Converter campos de data
      if (alunoInfo.dataNascimento && !alunoInfo.data_nascimento) {
        alunoInfo.data_nascimento = alunoInfo.dataNascimento;
      }
      if (alunoInfo.dataCriacao && !alunoInfo.data_criacao) {
        alunoInfo.data_criacao = alunoInfo.dataCriacao;
      }

      // Converter campos booleanos
      if (alunoInfo.isTrabalhando !== undefined && !alunoInfo.hasOwnProperty('is_trabalhando')) {
        alunoInfo.is_trabalhando = alunoInfo.isTrabalhando;
      }
      if (alunoInfo.isAceitaTermos !== undefined && !alunoInfo.hasOwnProperty('is_aceita_termos')) {
        alunoInfo.is_aceita_termos = alunoInfo.isAceitaTermos;
      }

      // Campos de notificação já estão em snake_case, não precisam conversão

      // Remover campos que não existem no sistema original
      delete alunoInfo.statusCadastro;
      delete alunoInfo.statusPagamento;
      delete alunoInfo.cep;
      delete alunoInfo.asaasExternalReference;

      transformed.alunoInfo = alunoInfo;
    }

    // ===== TRANSFORMAÇÕES PARA ADMINISTRADOR INFO =====
    if (transformed.administradorInfo) {
      const adminInfo = { ...transformed.administradorInfo };
      
      // Não precisamos mais converter IDs, pois usamos os nomes corretos no banco

      // Campos já estão em snake_case, não precisam conversão

      transformed.administradorInfo = adminInfo;
    }

    return transformed;
  }
}
