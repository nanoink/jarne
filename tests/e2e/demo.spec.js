import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

async function login(page, role = 'Empresa') {
  await page.goto('/login');
  await page.getByRole('button', { name: role, exact: true }).click();
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
  await expect(page.getByRole('heading', { name: /^Olá,/ })).toBeVisible();
}
async function switchRole(page, role) {
  await page.getByRole('button', { name: 'Sair e trocar de perfil' }).click();
  await page.getByRole('button', { name: role, exact: true }).click();
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
}

test('Login rejeita senha inválida e as rotas privadas exigem acesso', async ({ page }) => {
  await page.goto('/financeiro');
  await expect(page).toHaveURL(/login/);
  await page.getByLabel('Senha', { exact: true }).fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
  await expect(page.getByRole('alert')).toContainText('incorretos');
});

test('Percurso completo: solicitação, proposta, pagamento, execução e avaliação', async ({
  page,
}) => {
  await login(page);
  await page.goto('/solicitacoes/nova?servico=engenharia');
  await page.getByLabel('Título da solicitação').fill('Orçamento de recuperação — teste completo');
  await page
    .getByLabel('Descreva o que você precisa')
    .fill(
      'Precisamos de uma composição de custos completa para recuperar 30 mil metros quadrados de taludes.',
    );
  await page.getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Orçamento de recuperação — teste completo' }),
  ).toBeVisible();
  const requestUrl = page.url();
  await switchRole(page, 'Administrador');
  await page.goto(requestUrl);
  await page.getByRole('button', { name: 'Enviar proposta', exact: true }).click();
  await page
    .getByLabel('Escopo e entregáveis')
    .fill(
      'Planilha de custos, memória de cálculo e cronograma para o projeto de recuperação ambiental.',
    );
  await page.getByLabel('Valor bruto (R$)').fill('1000');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Enviar proposta', exact: true })
    .click();
  await expect(page.locator('.page-title .status')).toHaveText('Proposta recebida');
  await expect(page.locator('.proposal-summary')).toContainText('900,00');
  await switchRole(page, 'Empresa');
  await page.goto(requestUrl);
  await page.getByRole('button', { name: 'Analisar proposta' }).click();
  await page.getByRole('checkbox', { name: /Li o escopo/ }).check();
  await page.getByRole('button', { name: 'Aprovar e continuar' }).click();
  await page.getByRole('button', { name: 'Simular pagamento', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar pagamento simulado' }).click();
  await expect(page.getByRole('heading', { name: 'Deu tudo certo!' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar na plataforma' }).click();
  await expect(page.locator('.page-title .status')).toHaveText('Contratado');
  await switchRole(page, 'Prestador');
  await page.goto(requestUrl);
  await page.getByRole('button', { name: 'Iniciar execução' }).click();
  await page.getByRole('button', { name: 'Registrar entrega', exact: true }).click();
  await page
    .getByLabel('Resumo da entrega')
    .fill(
      'Planilha de custos e cronograma entregues conforme o escopo aprovado. Projeto pronto para revisão.',
    );
  await page.getByRole('button', { name: 'Enviar para aprovação' }).click();
  await expect(page.locator('.page-title .status')).toHaveText('Aguardando aprovação');
  await switchRole(page, 'Empresa');
  await page.goto(requestUrl);
  await page.getByRole('button', { name: 'Aprovar entrega', exact: true }).click();
  await page.getByRole('button', { name: '4 estrelas', exact: true }).click();
  await page.getByRole('button', { name: 'Aprovar e concluir' }).click();
  await expect(page.locator('.page-title .status')).toHaveText('Concluído');
  await page.reload();
  await expect(page.locator('.page-title .status')).toHaveText('Concluído');
  await expect(page.locator('.rating-display')).toContainText('★★★★');
});

test('Planos e meios de pagamento atualizam o financeiro e cancelam a cobrança anterior', async ({
  page,
}) => {
  await login(page);
  await page.goto('/planos');
  await page.getByRole('button', { name: 'Escolher Empresarial' }).click();
  await page.getByRole('button', { name: 'Cartão', exact: true }).click();
  await expect(page.getByText('Cartão fictício pré-configurado.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar pagamento simulado' }).click();
  await page.getByRole('button', { name: 'Continuar na plataforma' }).click();
  await expect(page.locator('.subscription-banner')).toContainText('Empresarial');
  await page.goto('/financeiro');
  await expect(page.getByRole('row', { name: /Plano Empresarial/ })).toContainText('Pago');
  await expect(page.getByRole('row', { name: /Plano Profissional/ })).toContainText('Cancelado');
  await page.goto('/planos');
  await page.getByRole('button', { name: 'Cancelar minha assinatura' }).click();
  await page.getByRole('button', { name: 'Cancelar assinatura', exact: true }).click();
  await expect(page.locator('.subscription-banner')).toContainText('Acesso avulso');
});

test('Upload, download e exclusão de documentos funcionam na sessão', async ({ page }) => {
  await login(page);
  await page.goto('/documentos');
  await page.getByRole('button', { name: 'Adicionar documento', exact: true }).click();
  await page.getByLabel('Arquivo', { exact: true }).setInputFiles({
    name: 'quantitativos-teste.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Quantitativos de exemplo: 30000 metros quadrados.'),
  });
  await page.getByRole('button', { name: 'Salvar documento' }).click();
  await expect(page.getByRole('button', { name: /quantitativos-teste.txt/ }).first()).toBeVisible();
  await page.reload();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar quantitativos-teste.txt', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('quantitativos-teste.txt');
  await page.getByRole('button', { name: 'Excluir quantitativos-teste.txt', exact: true }).click();
  await page.getByRole('button', { name: 'Excluir documento', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Baixar quantitativos-teste.txt', exact: true }),
  ).toHaveCount(0);
});

test('CRM, diário de obra e atualização cadastral persistem após recarregar', async ({ page }) => {
  await login(page);
  await page.goto('/comercial');
  await page.getByRole('button', { name: 'Nova oportunidade', exact: true }).click();
  await page.getByLabel('Nome da oportunidade').fill('Recuperação ambiental teste');
  await page.getByLabel('Empresa', { exact: true }).fill('Mineração Teste');
  await page.getByLabel('Contato', { exact: true }).fill('Pessoa Exemplo');
  await page.getByLabel('Valor estimado (R$)').fill('50000');
  await page.getByRole('button', { name: 'Salvar oportunidade' }).click();
  await page.getByLabel('Etapa de Recuperação ambiental teste').selectOption('Fechado');
  await expect(page.locator('.stage-3')).toContainText('Recuperação ambiental teste');
  await page.goto('/obras');
  await page.getByRole('button', { name: 'Acompanhar', exact: true }).first().click();
  await page
    .getByLabel('Adicionar registro')
    .fill('Equipe executou 1500 m². Registro de medição feito no trecho cinco.');
  await page.getByRole('button', { name: 'Salvar registro' }).click();
  await expect(page.locator('.work-logs')).toContainText('1500 m²');
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  await page.goto('/empresa');
  await page.getByLabel('Nome de exibição').fill('Raízes Teste');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.reload();
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Raízes Teste');
});

test('Cliente e prestador não veem solicitações de outras carteiras', async ({ page }) => {
  await login(page);
  await page.goto('/solicitacoes/VR-1049');
  await expect(page.getByRole('heading', { name: 'Solicitação não encontrada' })).toBeVisible();
  await switchRole(page, 'Prestador');
  await page.goto('/solicitacoes/VR-1047');
  await expect(page.getByRole('heading', { name: 'Solicitação não encontrada' })).toBeVisible();
  await page.goto('/empresas');
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
});

test('Navegação mobile, pesquisa, modal e restauração da demonstração', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('link', { name: 'Catálogo de serviços' }).click();
  await expect(
    page.getByRole('heading', { name: 'O apoio certo. No momento certo.' }),
  ).toBeVisible();
  await page.getByLabel('Qual apoio você precisa?').fill('jurídico');
  await expect(
    page
      .locator('.service-card')
      .filter({ has: page.getByRole('heading', { name: 'Apoio jurídico', exact: true }) }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Conhecer', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restaurar demo' }).click();
  await page.getByRole('button', { name: 'Restaurar dados', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('restaurada');
});

test('Todas as telas carregam sem erros de execução nos três perfis', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page);
  for (const path of [
    '/servicos',
    '/solicitacoes',
    '/obras',
    '/comercial',
    '/especialistas',
    '/documentos',
    '/financeiro',
    '/planos',
    '/empresa',
    '/suporte',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await switchRole(page, 'Administrador');
  for (const path of [
    '/',
    '/empresas',
    '/relatorios',
    '/especialistas',
    '/financeiro',
    '/suporte',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await switchRole(page, 'Prestador');
  for (const path of ['/', '/solicitacoes', '/documentos', '/financeiro', '/suporte']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('PDFs são arquivos válidos e o boleto conclui a simulação da mensalidade', async ({
  page,
}) => {
  await login(page);
  await page.goto('/documentos');
  const documentEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Baixar Memorial descritivo — BR-381.pdf', exact: true })
    .click();
  const document = await documentEvent;
  const bytes = await fs.readFile(await document.path());
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  await page.goto('/financeiro');
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  await page.getByRole('button', { name: 'Boleto', exact: true }).click();
  const boletoEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar exemplo de boleto' }).click();
  expect((await boletoEvent).suggestedFilename()).toBe('Boleto-demonstrativo.pdf');
  await page.getByRole('button', { name: 'Confirmar pagamento simulado' }).click();
  await page.getByRole('button', { name: 'Continuar na plataforma' }).click();
  await expect(page.getByRole('row', { name: /Plano Profissional/ })).toContainText('Pago');
});

test('Mensagens persistem e o cancelamento encerra a fatura pendente', async ({ page }) => {
  await login(page);
  await page.goto('/solicitacoes/VR-1047');
  await page
    .getByLabel('Sua mensagem', { exact: true })
    .fill('Gostaria de incluir uma revisão das condições de reajuste no contrato.');
  await page.getByRole('button', { name: 'Enviar mensagem', exact: true }).click();
  await page.reload();
  await expect(page.locator('.messages')).toContainText('condições de reajuste');
  await page.getByRole('button', { name: 'Analisar proposta' }).click();
  await page.getByRole('checkbox', { name: /Li o escopo/ }).check();
  await page.getByRole('button', { name: 'Aprovar e continuar' }).click();
  await page.getByRole('button', { name: 'Cancelar solicitação', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancelar solicitação', exact: true })
    .click();
  await expect(page.locator('.page-title .status')).toHaveText('Cancelado');
  await page.goto('/financeiro');
  await expect(page.getByRole('row', { name: /Revisão de contrato/ })).toContainText('Cancelado');
});

test('Administrador cadastra empresas, responde suporte e a busca global funciona', async ({
  page,
}) => {
  await login(page, 'Administrador');
  await page.goto('/empresas');
  await page.getByRole('button', { name: 'Cadastrar empresa', exact: true }).click();
  await page.getByLabel('Razão social').fill('Ambiental Nova Ltda');
  await page.getByLabel('Nome de exibição').fill('Ambiental Nova');
  await page.getByLabel('CNPJ demonstrativo').fill('11222333000181');
  await page.getByLabel('Responsável', { exact: true }).fill('Gestor de Exemplo');
  await page.getByLabel('E-mail', { exact: true }).fill('gestor@example.com');
  await page.getByLabel('Telefone', { exact: true }).fill('31999999999');
  await page.getByLabel('Cidade', { exact: true }).fill('Belo Horizonte');
  await page.getByRole('button', { name: 'Salvar empresa' }).click();
  await expect(page.getByRole('row', { name: /Ambiental Nova/ })).toBeVisible();
  await page.goto('/suporte');
  await page.getByRole('button', { name: /Como adicionar documentos/ }).click();
  await page
    .getByLabel('Responder atendimento')
    .fill(
      'Resposta de demonstração: envie o arquivo pela solicitação e confira o anexo na área de documentos.',
    );
  await page.getByRole('button', { name: 'Salvar resposta' }).click();
  await expect(page.locator('.support-answer')).toContainText('Resposta de demonstração');
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  await page.keyboard.press('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Buscar serviços ou solicitações...').fill('hidrossemeadura');
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /Orçamento de hidrossemeadura/ }),
  ).toBeVisible();
});
