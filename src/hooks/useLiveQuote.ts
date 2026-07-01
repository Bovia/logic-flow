import { useEffect, useState } from "react";
import { fetchStockQuote, type StockQuote } from "@/lib/quote";
import type { Exchange } from "@/types";

interface State {
  quote: StockQuote | null;
  loading: boolean;
  error: string | null;
}

export function useLiveQuote(ticker: string, exchange: Exchange, enabled = true): State {
  const [state, setState] = useState<State>({ quote: null, loading: false, error: null });

  useEffect(() => {
    if (!enabled || !ticker) return;

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchStockQuote(ticker, exchange)
      .then((quote) => {
        if (!cancelled) setState({ quote, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            quote: null,
            loading: false,
            error: err instanceof Error ? err.message : "行情加载失败",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, exchange, enabled]);

  return state;
}
