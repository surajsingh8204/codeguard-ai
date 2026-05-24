from typing import TypedDict

from langgraph.graph import StateGraph, END

from src.agents.security.security_agent import (
    SecurityAgent
)

from src.agents.performance.performance_agent import (
    PerformanceAgent
)

from src.agents.risk.risk_agent import (
    RiskAgent
)


class ReviewState(TypedDict):

    file_name: str

    patch: str

    security_review: dict

    performance_review: dict

    risk_review: dict


security_agent = SecurityAgent()

performance_agent = PerformanceAgent()

risk_agent = RiskAgent()

def risk_node(state: ReviewState):

    findings = {
        "security_review": state.get(
            "security_review",
            {}
        ),
        "performance_review": state.get(
            "performance_review",
            {}
        )
    }

    result = risk_agent.run(
        findings
    )

    state["risk_review"] = result

    return state

def security_node(state: ReviewState):

    result = security_agent.run(
        state["file_name"],
        state["patch"]
    )

    state["security_review"] = result

    return state


def performance_node(state: ReviewState):

    result = performance_agent.run(
        state["file_name"],
        state["patch"]
    )

    state["performance_review"] = result

    return state


workflow = StateGraph(ReviewState)

workflow.add_node(
    "security_agent",
    security_node
)

workflow.add_node(
    "performance_agent",
    performance_node
)

workflow.add_node(
    "risk_agent",
    risk_node
)

workflow.set_entry_point(
    "security_agent"
)

workflow.add_edge(
    "security_agent",
    "performance_agent"
)

workflow.add_edge(
    "performance_agent",
    "risk_agent"
)

workflow.add_edge(
    "risk_agent",
    END
)

app = workflow.compile()