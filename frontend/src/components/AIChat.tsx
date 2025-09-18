import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";

export const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Olá! Sou a IA especializada em custos de obras da GMX. Como posso ajudá-lo hoje?",
      time: "14:35"
    },
    {
      id: 2,
      type: "user", 
      content: "Qual fornecedor tem o melhor custo-benefício para vergalhões?",
      time: "14:36"
    },
    {
      id: 3,
      type: "ai",
      content: "Baseado no histórico de compras, a Siderúrgica Nacional apresenta o melhor custo-benefício para vergalhões:\n\n• Preço médio: R$ 8,50/kg (12% abaixo da média)\n• Prazo de entrega: 5 dias úteis\n• Taxa de conformidade: 98%\n• Última compra: 15% de economia\n\nRecomendo solicitar cotação com eles para seu próximo pedido.",
      time: "14:36"
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const quickActions = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "Análise de economia do mês",
      action: "show_monthly_savings"
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Contratos próximos ao limite",
      action: "show_budget_alerts"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Sugestões de otimização",
      action: "show_optimization_tips"
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: "user" as const,
      content: inputMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai" as const,
        content: "Analisando seus dados... Esta é uma resposta simulada da IA. Em uma implementação real, aqui seria integrada uma IA que analisa os dados reais do sistema de custos.",
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const responses = {
      show_monthly_savings: "📊 Economia do mês de setembro:\n\n• Total economizado: R$ 187.500\n• Meta mensal: R$ 150.000 (✅ 125% atingido)\n• Melhor negociação: Vergalhões - 18% de desconto\n• Fornecedor destaque: Siderúrgica Nacional",
      show_budget_alerts: "⚠️ Alertas de orçamento:\n\n• Infraestrutura Urbana Norte: 85% realizado (R$ 142K restante)\n• Complexo Comercial: 40% realizado (situação normal)\n• Edifício Residencial: 65% realizado (situação normal)",
      show_optimization_tips: "💡 Sugestões de otimização:\n\n1. Renegocie preços com Madeireira SP (potencial 8% economia)\n2. Considere compra antecipada de cimento (preço favorável)\n3. Diversifique fornecedores de acabamentos\n4. Automatize aprovações até R$ 10K"
    };

    const message = responses[action as keyof typeof responses];
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: "ai",
      content: message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IA Assistant</h1>
          <p className="text-muted-foreground">
            Assistente especializado em análise de custos e otimização
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => handleQuickAction(action.action)}
          >
            <div className="flex items-center gap-3">
              {action.icon}
              <span className="text-sm">{action.text}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Chat Interface */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat com IA Especializada
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages Container */}
          <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.type === 'user' ? 'order-1' : ''
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-background border'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="p-2 bg-muted rounded-full order-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Faça uma pergunta sobre custos, fornecedores, economia..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-primary">
              💡 <strong>Dica:</strong> A IA pode analisar tendências de custos, sugerir fornecedores, 
              identificar oportunidades de economia e responder perguntas sobre seus contratos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};