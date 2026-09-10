import React, {useMemo, useState} from 'react';
import {Box, render, Text, useApp, useInput} from 'ink';

type AgentState = 'working' | 'idle' | 'blocked' | 'watching' | 'attention' | 'done';

type AgentStatus = {
  id: string;
  machine: string;
  state: AgentState;
  task?: string;
  summary?: string;
  lastProgressAt: string;
  blockedOn?: string;
};

const demoAgents: AgentStatus[] = [
  {
    id: 'architect',
    machine: 'local',
    state: 'working',
    task: 'spectrum #441',
    summary: 'Deep work',
    lastProgressAt: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: 'lab-chief',
    machine: 'lab',
    state: 'watching',
    task: 'test stand',
    summary: 'Monitoring equipment',
    lastProgressAt: new Date(Date.now() - 7 * 60_000).toISOString(),
  },
  {
    id: 'acme',
    machine: 'vps-3',
    state: 'blocked',
    task: 'GH-91',
    summary: 'Waiting on integration test',
    blockedOn: 'integration test failure',
    lastProgressAt: new Date(Date.now() - 23 * 60_000).toISOString(),
  },
  {
    id: 'angel',
    machine: 'vps-1',
    state: 'idle',
    summary: 'Available',
    lastProgressAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
];

function age(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function count(agents: AgentStatus[], state: AgentState): number {
  return agents.filter((agent) => agent.state === state).length;
}

function App() {
  const {exit} = useApp();
  const [selected, setSelected] = useState(0);
  const agents = demoAgents;

  useInput((input, key) => {
    if (input === 'q') exit();
    if (input === 'j' || key.downArrow) setSelected((value) => Math.min(value + 1, agents.length - 1));
    if (input === 'k' || key.upArrow) setSelected((value) => Math.max(value - 1, 0));
  });

  const totals = useMemo(
    () => ({
      working: count(agents, 'working') + count(agents, 'watching'),
      idle: count(agents, 'idle') + count(agents, 'done'),
      blocked: count(agents, 'blocked'),
      attention: count(agents, 'attention'),
    }),
    [agents],
  );

  const current = agents[selected];

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box justifyContent="space-between">
        <Text bold>FOREMAN</Text>
        <Text dimColor>{agents.length} agents</Text>
      </Box>

      <Box marginTop={1} gap={3}>
        <Text>WORKING <Text bold>{totals.working}</Text></Text>
        <Text>IDLE <Text bold>{totals.idle}</Text></Text>
        <Text>BLOCKED <Text bold>{totals.blocked}</Text></Text>
        <Text>ATTENTION <Text bold>{totals.attention}</Text></Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text bold>{'  NAME'.padEnd(18)}{'MACHINE'.padEnd(14)}{'STATE'.padEnd(14)}{'TASK'.padEnd(22)}AGE</Text>
        </Box>
        {agents.map((agent, index) => (
          <Box key={agent.id}>
            <Text inverse={index === selected}>
              {`${index === selected ? '› ' : '  '}${agent.id}`.padEnd(18)}
              {agent.machine.padEnd(14)}
              {agent.state.padEnd(14)}
              {(agent.task ?? '-').padEnd(22)}
              {age(agent.lastProgressAt)}
            </Text>
          </Box>
        ))}
      </Box>

      {current && (
        <Box marginTop={1} borderStyle="round" paddingX={1} flexDirection="column">
          <Text bold>{current.id}</Text>
          <Text>{current.summary ?? 'No summary'}</Text>
          {current.blockedOn && <Text>Blocked on: {current.blockedOn}</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>[j/k] select   [↑/↓] select   [q] quit</Text>
      </Box>
    </Box>
  );
}

render(<App />);
