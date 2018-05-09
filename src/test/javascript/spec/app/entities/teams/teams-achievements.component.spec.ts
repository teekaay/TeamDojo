/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { TeamdojoTestModule } from '../../../test.module';
import { TeamsAchievementsComponent } from 'app/teams/teams-achievements.component';
import { TeamsAchievementsService } from 'app/teams/teams-achievements.service';
import { Badge } from 'app/shared/model/badge.model';
import { Level } from 'app/shared/model/level.model';
import { Team } from 'app/shared/model/team.model';
import { Dimension } from 'app/shared/model/dimension.model';
import Util from '../../../helpers/Util.service';

describe('Component Tests', () => {
    describe('Team Achievements Component', () => {
        let comp: TeamsAchievementsComponent;
        let fixture: ComponentFixture<TeamsAchievementsComponent>;
        let service: TeamsAchievementsService;
        const buildEntity = Util.wrap;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [TeamdojoTestModule],
                declarations: [TeamsAchievementsComponent],
                providers: [TeamsAchievementsService]
            })
                .overrideTemplate(TeamsAchievementsComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(TeamsAchievementsComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(TeamsAchievementsService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(122);
            comp.team = entity;
            spyOn(service, 'queryBadges').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [new Badge(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryBadges).toHaveBeenCalled();
            expect(comp.badges[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('Should load levels depending on team participations', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [buildEntity(new Level(123), { dimensionId: 122 }), buildEntity(new Level(124), { dimensionId: 122 })],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: jasmine.anything() }));
            expect(comp.levels[122].length).toEqual(2);
            expect(comp.levels[122][0]).toEqual(jasmine.objectContaining({ id: 123 }));
            expect(comp.levels[122][1]).toEqual(jasmine.objectContaining({ id: 124 }));
        });

        it('Should sort multiple levels descendingly', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [
                            buildEntity(new Level(126), { dimensionId: 122, dependsOnId: 125 }),
                            buildEntity(new Level(125), { dimensionId: 122, dependsOnId: 124 }),
                            buildEntity(new Level(123), { dimensionId: 122, dependsOnId: undefined }),
                            buildEntity(new Level(124), { dimensionId: 122, dependsOnId: 123 })
                        ],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: jasmine.anything() }));
            expect(comp.levels[122].length).toEqual(4);
            expect(comp.levels[122][0]).toEqual(jasmine.objectContaining({ id: 126 }));
            expect(comp.levels[122][1]).toEqual(jasmine.objectContaining({ id: 125 }));
            expect(comp.levels[122][2]).toEqual(jasmine.objectContaining({ id: 124 }));
            expect(comp.levels[122][3]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('Should sort multiple levels without a root level descendingly', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [
                            buildEntity(new Level(124), { dimensionId: 122, dependsOnId: 123 }),
                            buildEntity(new Level(125), { dimensionId: 122, dependsOnId: 123 }),
                            buildEntity(new Level(123), { dimensionId: 122, dependsOnId: 126 })
                        ],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: jasmine.anything() }));
            expect(comp.levels[122].length).toEqual(3);
            // use incoming order if dependency is the same
            expect(comp.levels[122][0]).toEqual(jasmine.objectContaining({ id: 124 }));
            expect(comp.levels[122][1]).toEqual(jasmine.objectContaining({ id: 125 }));
            expect(comp.levels[122][2]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('Should not fail if no level exists for dimension', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: [] }));
            expect(comp.levels[122].length).toEqual(0);
        });

        it('Should not fail if only a single level is retrieved', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [buildEntity(new Level(123), { dimensionId: 122 })],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: jasmine.anything() }));
            expect(comp.levels[122].length).toEqual(1);
            expect(comp.levels[122][0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('Should load multiple dimensions with levels', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            const entity = new Team(121);
            entity.participations = [new Dimension(122), new Dimension(123)];
            comp.team = entity;
            spyOn(service, 'queryLevels').and.returnValue(
                Observable.of(
                    new HttpResponse({
                        body: [buildEntity(new Level(124), { dimensionId: 122 }), buildEntity(new Level(125), { dimensionId: 123 })],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.queryLevels).toHaveBeenCalled();
            expect(comp.levels).toEqual(jasmine.objectContaining({ 122: jasmine.anything() }));
            expect(comp.levels[122].length).toEqual(1);
            expect(comp.levels[122][0]).toEqual(jasmine.objectContaining({ id: 124 }));

            expect(comp.levels).toEqual(jasmine.objectContaining({ 123: jasmine.anything() }));
            expect(comp.levels[123].length).toEqual(1);
            expect(comp.levels[123][0]).toEqual(jasmine.objectContaining({ id: 125 }));
        });
    });
});