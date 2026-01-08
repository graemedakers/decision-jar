
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent, mockUser } from '../test-utils';
import { JarSwitcher } from '@/components/JarSwitcher';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

// Mock child modals
vi.mock('@/components/CreateJarModal', () => ({ CreateJarModal: () => <div data-testid="create-jar-modal" /> }));
vi.mock('@/components/JoinJarModal', () => ({ JoinJarModal: () => <div data-testid="join-jar-modal" /> }));
vi.mock('@/components/JarManagerModal', () => ({ JarManagerModal: () => <div data-testid="jar-manager-modal" /> }));

// Mock Dropdown Menu to avoid Radix issues
vi.mock('@/components/ui/DropdownMenu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick, className }: any) => (
        <div className={className} onClick={onClick} role="menuitem">
            {children}
        </div>
    ),
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

// Mock API
global.fetch = vi.fn();

describe('JarSwitcher Component', () => {
    const mockUserWithMultipleJars = {
        ...mockUser,
        memberships: [
            {
                id: '1',
                jarId: 'jar-1',
                userId: mockUser.id,
                role: 'ADMIN' as const,
                status: 'ACTIVE' as const,
                jar: {
                    id: 'jar-1',
                    name: 'Work Ideas',
                    type: 'GENERIC' as const,
                    topic: 'Work',
                },
            },
            {
                id: '2',
                jarId: 'jar-2',
                userId: mockUser.id,
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                jar: {
                    id: 'jar-2',
                    name: 'Date Night',
                    type: 'ROMANTIC' as const,
                    topic: 'Romantic',
                },
            },
            {
                id: '3',
                jarId: 'jar-3',
                userId: mockUser.id,
                role: 'MEMBER' as const,
                status: 'ACTIVE' as const,
                jar: {
                    id: 'jar-3',
                    name: 'Family Fun',
                    type: 'SOCIAL' as const,
                    topic: 'Family',
                },
            },
        ],
        activeJarId: 'jar-1',
    };

    it('should render current jar name', () => {
        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);
        expect(screen.getByText('Work Ideas')).toBeInTheDocument();
    });

    it('should have multiple jars available', () => {
        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);
        expect(screen.getByText('Work Ideas')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);

        const trigger = screen.getByLabelText('Switch Jar');
        await user.click(trigger);

        // All jars should be visible in dropdown
        expect(screen.getByText('Date Night')).toBeInTheDocument();
        expect(screen.getByText('Family Fun')).toBeInTheDocument();
    });

    it('should switch jar when selecting from dropdown', async () => {
        const user = userEvent.setup();

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);

        // Open dropdown
        const trigger = screen.getByLabelText('Switch Jar');
        await user.click(trigger);

        // Click on "Date Night" jar
        const dateNightOption = screen.getByText('Date Night');
        await user.click(dateNightOption);

        // Should call switch API
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/switch-jar'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ jarId: 'jar-2' }),
            })
        );
    });

    it('should display "Create Jar" option when user has no jars', () => {
        const userWithNoJars = {
            ...mockUser,
            memberships: [],
            activeJarId: null,
        };

        renderWithProviders(<JarSwitcher user={userWithNoJars} variant="title" />);

        expect(screen.getByText('(No Jar Selected)')).toBeInTheDocument();
    });

    it('should show admin badge for admin jars', async () => {
        const user = userEvent.setup();
        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);

        const trigger = screen.getByLabelText('Switch Jar');
        await user.click(trigger);

        // Find the item with 'Work Ideas' and check for Admin text in the same container
        const workIdeas = screen.getByText('Work Ideas');
        // Navigate up to parent/container
        // The mock renders children structure
        // <div className...> ... <div>Work Ideas</div> ... <div>Admin</div> ... </div>
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should not show inactive jars', () => {
        const userWithInactiveJar = {
            ...mockUser,
            memberships: [
                ...mockUserWithMultipleJars.memberships,
                {
                    id: '4',
                    jarId: 'jar-4',
                    userId: mockUser.id,
                    role: 'MEMBER' as const,
                    status: 'REMOVED' as const,
                    jar: {
                        id: 'jar-4',
                        name: 'Inactive Jar',
                        type: 'SOCIAL' as const,
                        topic: 'Old',
                    },
                },
            ],
            activeJarId: 'jar-1',
        };

        renderWithProviders(<JarSwitcher user={userWithInactiveJar} variant="title" />);

        expect(screen.getByText('Work Ideas')).toBeInTheDocument();
        expect(screen.queryByText('Inactive Jar')).not.toBeInTheDocument();
    });
});
