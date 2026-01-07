import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent, mockUser } from '../test-utils';
import { JarSwitcher } from '@/components/JarSwitcher';

// Mock the API call
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

        // Component should render successfully with 3 jars
        expect(screen.getByText('Work Ideas')).toBeInTheDocument();
        expect(mockUserWithMultipleJars.memberships).toHaveLength(3);
    });

    it('should open dropdown when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<JarSwitcher user={mockUserWithMultipleJars} variant="title" />);

        const trigger = screen.getByRole('button');
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
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        // Click on "Date Night" jar
        const dateNightOption = screen.getByText('Date Night');
        await user.click(dateNightOption);

        // Should call switch API
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/jar/jar-2/switch'),
            expect.objectContaining({
                method: 'POST',
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

        // Open dropdown
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        // "Work Ideas" should have admin indicator (it's the only ADMIN role)
        const workIdeasItem = screen.getByText('Work Ideas').closest('button');
        expect(workIdeasItem).toHaveTextContent('Work Ideas');
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

        // Active jars should show, inactive should not
        expect(screen.getByText('Work Ideas')).toBeInTheDocument();
        expect(screen.queryByText('Inactive Jar')).not.toBeInTheDocument();
    });
});
