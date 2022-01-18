import DataService from '../services/data.service';
import { parseISO, format } from 'date-fns'

const initialState = {
    activities: []
}

function padTime(data){
    if (data != null && data <= 9 ){
        return "0" + data;
    }
    else return data;
}

function niceData(x){
    return {
        _id: x._id,
        startTime: format(parseISO(x.startTime), "MM/dd/yyyy' 'h:mm a"),
        endTime: x?.endTime == null ? "": format(parseISO(x.endTime), "MM/dd/yyyy' 'h:mm a"),
        totalElapsedMinutes: x.totalElapsedMinutes,
        elapsedHours: x.elapsedHours,
        elapsedMinutes: x.elapsedMinutes,
        elapsedFormat: x?.endTime == null ? "" : padTime(x.elapsedHours)+ ":" + padTime(x.elapsedMinutes)
    };
}

function allNiceData(data){
    return data.map(x => {
        return niceData(x);
    })
}

export const activity = {
    namespaced: true,
    state: initialState,
    actions: {
        init({commit}){
            return DataService.getActivities().then(
                ret => {
                    commit('getActivities', ret)
                    return Promise.resolve(ret);
                }
            )
        },
        postActivity({ commit }, data){
            var d = '';
            return DataService.postActivity(data).then(
                ret => {
                    console.log("ret", ret);
                    d = ret;
                    Promise.resolve(ret);

                    return DataService.getActivity(d.data._id).then(
                        ret2 => {
                            console.log("ret2", ret2);
                            commit('updateActivity', ret2)
                            return Promise.resolve(ret2);
                        }
                    );
                }
            );
        }
    },
    mutations: {
        getActivities(state, ret){
            state.activities = allNiceData(ret.data);
        },
        updateActivity(state, ret){

            state.activities.push(niceData(ret.data));
            state.activities.sort(function compare(a, b) {
                var dateA = new Date(a.startTime);
                var dateB = new Date(b.startTime);
                return dateB - dateA;
              });
        }
    },
    getters: {
        all: (state) => {
            return state.activities;
        },

        totalMinutes: (state, getters) => {
            var totalMin = 0;
            getters.all.forEach((x) => {
                totalMin += x.totalElapsedMinutes > 0 ? parseInt(x.totalElapsedMinutes) : 0
            });
            return totalMin
            
        }
    }
};