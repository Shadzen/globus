// Agent pages only: mobile menu and any other agent-specific logic.
// Used by AgentLayout (agent/tour_search, agent/tour_search_login).
import { initHeader } from './main/header'

const initAgent = () => {
    initHeader()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgent)
} else {
    initAgent()
}

document.addEventListener('astro:after-swap', initAgent)
