import { useState, useEffect, useRef } from "react";
import "./App.css";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Departamento {
  id: string;
  nome: string;
  icone: string;
  tituloProcessos?: string;
  processos: string[];
}

interface ItemTransversal {
  id: string;
  icone: string;
  texto: string;
}

interface OrgData {
  titulo: string;
  noTopo: string;
  iconeTopo: string;
  departamentos: Departamento[];
  transversais: {
    titulo: string;
    subtitulo: string;
    itens: ItemTransversal[];
    iconeSecao?: string;
  };
}

// ─── Dados padrão (espelho fiel do Figma) ────────────────────────────────────

const DADOS_PADRAO: OrgData = {
  titulo: "ORGANOGRAMA E PROCESSOS POR SETOR",
  noTopo: "DIRETORIA\nGERAL",
  iconeTopo: "👩‍💼",
  departamentos: [
    {
      id: "admin",
      nome: "ADMINISTRAÇÃO",
      icone: "🏢",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Planejamento estratégico administrativo",
        "Gestão de recursos corporativos e indicadores",
        "Políticas, normas e compliance",
        "Gestão de contratos administrativos",
        "Relatórios gerenciais e indicadores",
        "Comunicação interna e governança",
      ],
    },
    {
      id: "rh",
      nome: "RECURSOS\nHUMANOS (RH)",
      icone: "👥",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Recrutamento e seleção",
        "Admissão e integração de colaboradores",
        "Gestão de ponto, folha e benefícios",
        "Treinamentos e desenvolvimento",
        "Avaliação de desempenho",
        "Saúde, segurança e bem-estar (SSO)",
        "Relações trabalhistas e clima organizacional",
      ],
    },
    {
      id: "dp",
      nome: "DP / LOGÍSTICA",
      icone: "📋",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Administração de pessoal e folha de pagamento",
        "Obrigações trabalhistas e encargos",
        "Controle de férias e afastamentos",
        "Gestão de ASO, PCMSO e documentação legal",
        "Integração com canteiros e bases offshore",
        "Logística de transporte, viagens e hospedagem",
        "Controle de EPIs, uniformes e materiais de apoio",
      ],
    },
    {
      id: "financeiro",
      nome: "FINANCEIRO",
      icone: "💰",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Gestão contábil e fiscal",
        "Contas a pagar e a receber",
        "Conciliação bancária",
        "Gestão de fluxo de caixa",
        "Elaboração de relatórios financeiros",
        "Controle de impostos e tributos",
        "Gestão de custos e despesas",
      ],
    },
    {
      id: "projetos",
      nome: "PROJETOS",
      icone: "📁",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Levantamento de escopo e requisitos",
        "Planejamento e engenharia",
        "Desenvolvimento de documentos técnicos",
        "Compatibilização e integração de disciplinas",
        "Análise de riscos e viabilidade",
        "Emissão de desenhos, especificações e listas",
        "Acompanhamento técnico e suporte à execução",
      ],
    },
    {
      id: "orcamento",
      nome: "ORÇAMENTO",
      icone: "🧮",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Levantamento de quantitativos",
        "Composição de custos diretos e indiretos",
        "Elaboração de propostas técnico-comerciais",
        "Análise de cenários e competitividade",
        "Controle de revisões e aprovações",
        "Integração com projetos e suprimentos",
        "Acompanhamento de desvios e planejamento de custos",
      ],
    },
    {
      id: "compras",
      nome: "COMPRAS /\nSUPRIMENTOS",
      icone: "🛒",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Planejamento de compras",
        "Cotações e negociação com fornecedores",
        "Homologação e avaliação de fornecedores",
        "Emissão de pedidos de compra",
        "Acompanhamento de entregas",
        "Gestão de contratos de fornecimento",
        "Controle de qualidade, custos e prazos",
      ],
    },
    {
      id: "almoxarifado",
      nome: "ALMOXARIFADO",
      icone: "🏭",
      tituloProcessos: "PROCESSOS",
      processos: [
        "Recebimento e conferência de materiais",
        "Armazenagem e controle de estoques",
        "Endereçamento e rastreabilidade",
        "Separação e expedição de materiais",
        "Inventários e conciliação de estoque",
        "Controle de validade e obsolescência",
        "Apoio logístico a canteiros e embarcações",
      ],
    },
  ],
  transversais: {
    titulo: "PROCESSOS TRANSVERSAIS",
    subtitulo: "(APLICÁVEIS A TODOS OS SETORES)",
    iconeSecao: "⚙️",
    itens: [
      { id: "ssma",       icone: "🛡️", texto: "Saúde, Segurança e Meio Ambiente (SSMA)" },
      { id: "compliance", icone: "⚖️", texto: "Compliance & Ética Corporativa" },
      { id: "riscos",     icone: "📊", texto: "Gestão de Riscos e Controle Interno" },
      { id: "info",       icone: "🗂️", texto: "Gestão da Informação e Documentação" },
      { id: "melhoria",   icone: "👥", texto: "Melhoria Contínua e Gestão de Indicadores" },
    ],
  },
};

// ─── Cores do design (baseadas no site Prospecta) ──────────────────────────

const C = {
  navy:       "#CD4F26",
  deptBg:     "#FFFFFF",
  deptBorder: "#CD4F26",
  linha:      "#FFFFFF",
  branco:     "#FFFFFF",
  fundo:      "#CD4F26",
  accent:     "#F59E0B",
};

// ─── Componente: Texto Editável ───────────────────────────────────────────────
// Usa contenteditable para edição WYSIWYG.
// Sincroniza com React state apenas no blur/input para evitar conflito de cursor.

function TextoEditavel({
  valor,
  aoMudar,
  modoEdicao,
  tag: Tag = "span",
  estilo,
  className,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  modoEdicao: boolean;
  tag?: keyof JSX.IntrinsicElements;
  estilo?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<any>(null);
  const editando = useRef(false);

  // Atualiza o DOM quando o valor muda externamente (ex: importar JSON)
  useEffect(() => {
    if (!editando.current && ref.current) {
      ref.current.textContent = valor;
    }
  }, [valor]);

  // Re-popula ao entrar/sair do modo de edição
  useEffect(() => {
    if (!editando.current && ref.current) {
      ref.current.textContent = valor;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoEdicao]);

  const estiloEdicao: React.CSSProperties = modoEdicao
    ? { cursor: "text", minWidth: "1em" }
    : {};

  return (
    <Tag
      // @ts-expect-error: ref tipagem genérica
      ref={ref}
      contentEditable={modoEdicao}
      suppressContentEditableWarning
      onFocus={() => { editando.current = true; }}
      onBlur={() => {
        editando.current = false;
        if (ref.current) aoMudar(ref.current.textContent ?? "");
      }}
      onInput={() => {
        if (ref.current) aoMudar(ref.current.textContent ?? "");
      }}
      style={{ ...estilo, ...estiloEdicao }}
      className={className}
    />
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────

export default function App() {
  const [modoEdicao, setModoEdicao] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Carrega do localStorage ou usa os dados padrão
  const [dados, setDados] = useState<OrgData>(() => {
    try {
      const salvo = localStorage.getItem("organograma-v1");
      return salvo ? (JSON.parse(salvo) as OrgData) : DADOS_PADRAO;
    } catch {
      return DADOS_PADRAO;
    }
  });

  // Função para resetar para dados padrão
  const resetarDados = () => {
    localStorage.removeItem("organograma-v1");
    setDados(DADOS_PADRAO);
  };

  // Salva automaticamente a cada mudança
  useEffect(() => {
    localStorage.setItem("organograma-v1", JSON.stringify(dados));
  }, [dados]);

  // Define grid-template-columns dinamicamente via CSS variable
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.style.setProperty("--grid-columns", `repeat(${dados.departamentos.length}, 1fr)`);
    }
  }, [dados.departamentos.length]);

  // ─── Funções de atualização de estado ───

  const setTitulo        = (v: string) => setDados(d => ({ ...d, titulo: v }));
  const setNoTopo        = (v: string) => setDados(d => ({ ...d, noTopo: v }));

  const setNomeDept = (id: string, v: string) =>
    setDados(d => ({
      ...d,
      departamentos: d.departamentos.map(dep =>
        dep.id === id ? { ...dep, nome: v } : dep
      ),
    }));

  const setProcesso = (deptId: string, idx: number, v: string) =>
    setDados(d => ({
      ...d,
      departamentos: d.departamentos.map(dep =>
        dep.id === deptId
          ? { ...dep, processos: dep.processos.map((p, i) => (i === idx ? v : p)) }
          : dep
      ),
    }));

  const setIconeDept = (id: string, v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      departamentos: d.departamentos.map((dep: Departamento) =>
        dep.id === id ? { ...dep, icone: v } : dep
      ),
    }));

  const setIconeTopo = (v: string) => setDados((d: OrgData) => ({ ...d, iconeTopo: v }));

  const setTituloProcessos = (deptId: string, v: string) =>
    setDados((d: OrgData) => ({
      ...d,
      departamentos: d.departamentos.map((dep: Departamento) =>
        dep.id === deptId ? { ...dep, tituloProcessos: v } : dep
      ),
    }));

  // ─── Exportar JSON ───

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "organograma.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Importar JSON ───

  const importarJSON = () => {
    const input   = document.createElement("input");
    input.type    = "file";
    input.accept  = ".json";
    input.onchange = (e) => {
      const arquivo = (e.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = (ev) => {
        try {
          setDados(JSON.parse(ev.target?.result as string) as OrgData);
        } catch {
          alert("Arquivo JSON inválido.");
        }
      };
      leitor.readAsText(arquivo);
    };
    input.click();
  };

  // ─── Cálculos para o SVG conector ───
  // Cada departamento ocupa 100 unidades no viewBox.
  // Centro da coluna i → i * 100 + 50.
  // preserveAspectRatio="none" escala para 100% do container.
  // vectorEffect="non-scaling-stroke" mantém espessura uniforme.

  const N    = dados.departamentos.length;
  const svgW = N * 100;

  return (
    <>
      <div className="app-container">

        {/* ══ BARRA DE FERRAMENTAS ══════════════════════════════════════════ */}
        <div className="toolbar">
          {/* Logo Prospecta */}
          <img
            src="https://prospectario.com.br/wp-content/uploads/2023/01/logo.png"
            alt="Prospecta Logo"
            className="toolbar-logo"
          />

          <span className="toolbar-title">
            📊 Organograma Editor
          </span>

          <div className="toolbar-buttons">
            <button className="btn-tool" onClick={exportarJSON} aria-label="Exportar JSON">
              📥 Exportar JSON
            </button>
            <button className="btn-tool" onClick={importarJSON} aria-label="Importar JSON">
              📤 Importar JSON
            </button>
            <button className="btn-tool" onClick={resetarDados} aria-label="Resetar dados">
              🔄 Resetar
            </button>
          </div>

          <span className="toolbar-hint">
            ✏️ Clique em qualquer texto para editar — salvo automaticamente
          </span>
        </div>

        {/* ══ CONTEÚDO PRINCIPAL ═══════════════════════════════════════════ */}
        <main
          className="main-content"
          role="main"
          aria-label="Organograma e processos por setor"
        >

          {/* Título principal */}
          <header className="main-header">
            <TextoEditavel
              valor={dados.titulo}
              aoMudar={setTitulo}
              modoEdicao={modoEdicao}
              tag="h1"
              className="main-title"
            />
          </header>

          {/* ── Árvore do organograma ─────────────────────────────────────── */}
          <div className="org-tree">

            {/* Nó topo: Diretoria Geral */}
            <div
              role="region"
              aria-label="Diretoria Geral"
              className="topo-node"
            >
              <TextoEditavel
                valor={dados.iconeTopo}
                aoMudar={setIconeTopo}
                modoEdicao={modoEdicao}
                tag="span"
                className="topo-icon"
              />
              <TextoEditavel
                valor={dados.noTopo}
                aoMudar={setNoTopo}
                modoEdicao={modoEdicao}
                tag="span"
                className="topo-text"
              />
            </div>

            {/* Linha vertical do nó topo até o SVG conector */}
            <div
              className="linha-v-topo"
              aria-hidden="true"
            />

            {/* SVG: linha horizontal + descidas verticais para cada departamento */}
            {/* Funciona porque gap=0 no grid abaixo → colunas perfeitamente simétricas */}
            <svg
              className="svg-conector"
              width="100%"
              height={28}
              viewBox={`0 0 ${svgW} 28`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Barra horizontal */}
              <line
                x1={50} y1={2} x2={svgW - 50} y2={2}
                stroke={C.linha} strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Descidas para cada coluna */}
              {dados.departamentos.map((_, i) => (
                <line
                  key={i}
                  x1={i * 100 + 50} y1={2}
                  x2={i * 100 + 50} y2={28}
                  stroke={C.linha} strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* ── Grade de departamentos ── */}
            {/* gap=0 é intencional para que o SVG acima alinhe perfeitamente */}
            <div
              ref={gridRef}
              className="org-grid"
            >
              {dados.departamentos.map((dept) => (
                <article
                  key={dept.id}
                  aria-label={`Departamento: ${dept.nome.replace("\n", " ")}`}
                  className="dept-article"
                >
                  {/* Caixa do departamento */}
                  <div className="dept-box">
                    <TextoEditavel
                      valor={dept.icone}
                      aoMudar={(v) => setIconeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      className="dept-icon"
                    />
                    <TextoEditavel
                      valor={dept.nome}
                      aoMudar={(v) => setNomeDept(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="span"
                      className="dept-name"
                    />
                  </div>

                  {/* Linha vertical para processos */}
                  <div
                    aria-hidden="true"
                    className="linha-v-processos"
                  />

                  {/* Caixa de processos */}
                  <section
                    aria-label={`Processos de ${dept.nome.replace("\n", " ")}`}
                    className="processos-section"
                  >
                    <TextoEditavel
                      valor={dept.tituloProcessos || "PROCESSOS"}
                      aoMudar={(v) => setTituloProcessos(dept.id, v)}
                      modoEdicao={modoEdicao}
                      tag="h2"
                      className="processos-title"
                    />
                    <ul className="processos-list">
                      {dept.processos.map((proc, idx) => (
                        <li key={idx} className="processos-item">
                          <TextoEditavel
                            valor={proc}
                            aoMudar={(v) => setProcesso(dept.id, idx, v)}
                            modoEdicao={modoEdicao}
                            tag="span"
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                </article>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
