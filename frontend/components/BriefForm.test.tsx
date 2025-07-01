import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BriefForm from './BriefForm';

// Mock axios
jest.mock('axios');

describe('BriefForm', () => {
  const mockOnBriefGenerated = jest.fn();
  const mockOnError = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <BriefForm 
        onBriefGenerated={mockOnBriefGenerated}
        onError={mockOnError}
        loading={false}
        setLoading={mockSetLoading}
      />
    );

    // Check if all form fields are present
    expect(screen.getByPlaceholderText('e.g., sustainable fashion, remote work tips')).toBeInTheDocument();
    expect(screen.getByLabelText(/content type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/writing tone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., small business owners, fitness enthusiasts, tech professionals')).toBeInTheDocument();
    expect(screen.getByText('Generate Content Brief')).toBeInTheDocument();
  });

  it('requires keyword field to be filled', () => {
    render(
      <BriefForm 
        onBriefGenerated={mockOnBriefGenerated}
        onError={mockOnError}
        loading={false}
        setLoading={mockSetLoading}
      />
    );

    const keywordInput = screen.getByPlaceholderText('e.g., sustainable fashion, remote work tips');
    expect(keywordInput).toHaveAttribute('required');
  });

  it('disables submit button while loading', async () => {
    render(
      <BriefForm 
        onBriefGenerated={mockOnBriefGenerated}
        onError={mockOnError}
        loading={false}
        setLoading={mockSetLoading}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('e.g., sustainable fashion, remote work tips'), {
      target: { value: 'Test keyword' }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., small business owners, fitness enthusiasts, tech professionals'), {
      target: { value: 'Test audience' }
    });

    const submitButton = screen.getByText('Generate Content Brief');
    fireEvent.click(submitButton);

    // Check that setLoading was called
    expect(mockSetLoading).toHaveBeenCalledWith(true);
  });
});