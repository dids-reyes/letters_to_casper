import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import StatusPage from './StatusPage';

jest.mock('axios');

describe('StatusPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
    axios.get.mockResolvedValue({
      data: {
        status: 'operational',
        statusDescription: 'All Systems Operational',
        region: 'Oregon, US (Render)',
        components: [
          {
            id: 'web_app',
            name: 'Web Application (letterstocasper.com)',
            group: 'Core Platform & Delivery',
            description: 'Public web frontend',
            status: 'operational',
            uptimePercentage: 99.99,
          },
          {
            id: 'api_gateway',
            name: 'REST API & Microservices',
            group: 'Core Platform & Delivery',
            description: 'Render backend services',
            status: 'operational',
            uptimePercentage: 99.98,
          },
        ],
        metrics: {
          uptime90Days: 99.99,
          avgLatencyMs: 125,
          activeIncidentsCount: 0,
          resolvedIncidentsCount: 2,
        },
        incidents: [
          {
            id: 'inc-test-1',
            title: 'Transient Email Dispatch Latency with Brevo API',
            status: 'resolved',
            dateLabel: 'September 2, 2026',
            updates: [
              {
                status: 'resolved',
                timestamp: '2026-09-02T07:22:00.000Z',
                message: 'All delayed messages processed.',
              },
            ],
          },
        ],
      },
    });
  });

  const renderStatusPage = async () => {
    const utils = render(
      <BrowserRouter>
        <StatusPage />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    return utils;
  };

  test('renders the status header, brand badge, and return link', async () => {
    await renderStatusPage();

    expect(screen.getByLabelText('Letters to Casper Home')).toBeInTheDocument();
    expect(screen.getByText(/System Status/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to letters/i })).toHaveAttribute('href', '/');
  });

  test('displays overall operational banner and key metric cards', async () => {
    await renderStatusPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/All Systems Operational/i);
    expect(screen.getByText(/90-Day Uptime/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Response Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Region/i)).toBeInTheDocument();
  });

  test('renders the system latency chart and toggles time interval pills', async () => {
    await renderStatusPage();

    expect(screen.getByText(/System API Response Time \(ms\)/i)).toBeInTheDocument();

    const pill7d = screen.getByRole('tab', { name: '7D' });
    fireEvent.click(pill7d);
    expect(pill7d).toHaveClass('is-active');

    const pill30d = screen.getByRole('tab', { name: '30D' });
    fireEvent.click(pill30d);
    expect(pill30d).toHaveClass('is-active');
  });

  test('renders component group sections and 90-day history bars', async () => {
    await renderStatusPage();

    await waitFor(() => {
      expect(screen.getByText(/Component Status & 90-Day History/i)).toBeInTheDocument();
    });

    const webAppElements = screen.getAllByText(/Web Application/i);
    expect(webAppElements.length).toBeGreaterThan(0);
    const operationalBadges = screen.getAllByText('Operational');
    expect(operationalBadges.length).toBeGreaterThan(0);
  });

  test('opens and interacts with Subscribe to Updates modal', async () => {
    await renderStatusPage();

    const subscribeBtn = screen.getByRole('button', { name: /Subscribe to system status updates/i });
    fireEvent.click(subscribeBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Subscribe to Status Updates/i)).toBeInTheDocument();

    // Switch to Webhook tab
    const webhookTab = screen.getByRole('tab', { name: /Webhook/i });
    fireEvent.click(webhookTab);
    expect(screen.getByText(/POST https:\/\/ltc-service.onrender.com/i)).toBeInTheDocument();

    // Switch to RSS tab
    const rssTab = screen.getByRole('tab', { name: /RSS \/ Atom/i });
    fireEvent.click(rssTab);
    expect(screen.getByText(/https:\/\/letterstocasper.com\/status\/rss.xml/i)).toBeInTheDocument();

    // Switch back to Email and submit
    const emailTab = screen.getByRole('tab', { name: 'Email' });
    fireEvent.click(emailTab);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'reader@casper.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(screen.getByText(/Subscribed successfully!/i)).toBeInTheDocument();
    });
  });

  test('filters past incident logs by status tab', async () => {
    await renderStatusPage();

    expect(screen.getByText(/Past Incidents & Event History/i)).toBeInTheDocument();

    const maintenanceTab = screen.getByRole('tab', { name: /Maintenance \(0\)/i });
    fireEvent.click(maintenanceTab);
    expect(screen.getByText(/No incidents reported in this view/i)).toBeInTheDocument();

    const allTab = screen.getByRole('tab', { name: /All Updates/i });
    fireEvent.click(allTab);
    expect(screen.getByText(/Transient Email Dispatch Latency/i)).toBeInTheDocument();
  });

  test('handles manual refresh click gracefully', async () => {
    await renderStatusPage();

    const refreshBtn = screen.getByTitle('Refresh status now');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('handles backend failure by falling back to operational presentation without crashing', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    await renderStatusPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    expect(screen.getByText(/Component Status & 90-Day History/i)).toBeInTheDocument();
  });
});
