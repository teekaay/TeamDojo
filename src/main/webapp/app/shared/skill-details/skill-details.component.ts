import { EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITeam } from 'app/shared/model/team.model';
import { ISkill } from 'app/shared/model/skill.model';
import { AchievableSkill, IAchievableSkill } from 'app/shared/model/achievable-skill.model';
import { TeamsSkillsService } from 'app/teams/teams-skills.service';
import { TeamsSkillsComponent } from 'app/teams/teams-skills.component';
import { SkillDetailsInfoComponent } from 'app/shared/skill-details/skill-details-info.component';
import { IComment } from 'app/shared/model/comment.model';
import { IBadge } from 'app/shared/model/badge.model';

export class SkillDetailsComponentParent {
    team: ITeam;
    teams: ITeam[];
    skill: ISkill;
    badges: IBadge[] = [];
    skills: ISkill[] = [];
    selectedTeam: ITeam;
    comments: IComment[];
    skillComments: IComment[];

    @Output() onSkillChanged = new EventEmitter<IAchievableSkill>();

    @ViewChild(TeamsSkillsComponent) skillList;
    @ViewChild(SkillDetailsInfoComponent) skillInfo;

    constructor(public route: ActivatedRoute, public teamsSkillsService: TeamsSkillsService) {}

    setResolvedData({ teams, skill, comments, selectedTeam, badges, skills }): void {
        this.teams = (teams && teams.body ? teams.body : teams) || [];
        this.skill = skill && skill.body ? skill.body : skill;
        this.selectedTeam = selectedTeam && selectedTeam.body ? selectedTeam.body : selectedTeam;
        this.badges = (badges && badges.body ? badges.body : badges) || [];
        this.skills = (skills && skills.body ? skills.body : skills) || [];
        this.comments = (comments && comments.body ? comments.body : comments) || [];
        this._mapCommentAuthors();
        this.skillComments = this._getSkillComments();
    }

    onSkillInListChanged(skillObjs) {
        this.skill = skillObjs.iSkill;
        this.skillInfo.onSkillInListChanged(skillObjs);
        this.skillComments = this._getSkillComments();
    }

    onSkillInListClicked(skillObjs) {
        this.skill = skillObjs.iSkill;
        this.skillInfo.onSkillInListClicked(skillObjs);
        this.skillComments = this._getSkillComments();
    }

    onCommentSubmitted(newComment: IComment) {
        if (newComment) {
            this.comments.push(newComment);
            this._mapCommentAuthors();
            this.skillComments = this._getSkillComments();
        }
    }

    protected _mapCommentAuthors() {
        (this.comments || [])
            .filter((comment: IComment) => comment.author === undefined || Object.keys(comment.author).length === 0)
            .forEach((comment: IComment) => {
                comment.author = (this.teams || []).find((t: ITeam) => t.id === comment.teamId) || {};
            });
    }

    protected _getSkillComments(): IComment[] {
        return (this.comments || [])
            .filter(comment => comment.skillId === this.skill.id)
            .sort((comment1, comment2) => comment1.creationDate.diff(comment2.creationDate));
    }
}
